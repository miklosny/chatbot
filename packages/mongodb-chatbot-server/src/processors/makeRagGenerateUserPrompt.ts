import { stripIndents } from "common-tags";
import { FindContentFunc } from "../routes";
import { GenerateUserPromptFunc } from "./GenerateUserPromptFunc";
import { QueryPreprocessorFunc } from "./QueryPreprocessorFunc";
import { logRequest } from "../utils";
import { Conversation, UserMessage } from "../services";
import { EmbeddedContent, References } from "mongodb-rag-core";

export interface MakeRagGenerateUserPromptParams {
  queryPreprocessor: QueryPreprocessorFunc;
  findContent: FindContentFunc;
  makeReferenceLinks?: MakeReferenceLinksFunc;
  maxChunkContextTokens?: number;
  makeUserMessage: MakeUserMessageFunc;
}

export type MakeUserMessageFuncParams = {
  content: EmbeddedContent[];
  originalUserMessage: string;
  preprocessedUserMessage?: string;
  queryEmbedding?: number[];
  rejectQuery?: boolean;
};
export type MakeUserMessageFunc = (
  params: MakeUserMessageFuncParams
) => Promise<UserMessage>;
/**
  Function that generates the references in the response to user.
 */
export type MakeReferenceLinksFunc = (chunks: EmbeddedContent[]) => References;

const DEFAULT_MAX_CONTEXT_TOKENS = 1500; // magic number for max context tokens for LLM

/**
  Construct a {@link GenerateUserPromptFunc} function
  that uses retrieval augmented generation (RAG) to generate the user prompt.
 */
export function makeRagGenerateUserPrompt({
  queryPreprocessor,
  findContent,
  makeReferenceLinks = makeDefaultReferenceLinks,
  maxChunkContextTokens = DEFAULT_MAX_CONTEXT_TOKENS,
  makeUserMessage,
}: MakeRagGenerateUserPromptParams): GenerateUserPromptFunc {
  return async ({ userMessageText, conversation, reqId }) => {
    // --- PREPROCESS ---
    const preprocessResult = await preProcessUserMessage({
      queryPreprocessor,
      userMessageText,
      conversation,
      reqId,
    });
    const { rejectQuery, query: preprocessedUserMessageContent } =
      preprocessResult ?? {};
    if (rejectQuery) {
      logRequest({
        reqId,
        message: "Preprocessor rejected query",
      });
      return {
        rejectQuery: true,
        userMessage: { role: "user", content: userMessageText },
      };
    }

    const query = preprocessedUserMessageContent ?? userMessageText;

    // --- VECTOR SEARCH / RETRIEVAL ---
    const { content, queryEmbedding } = await findContent({
      query,
      ipAddress: "::1",
    });
    if (content.length === 0) {
      logRequest({
        reqId,
        message: "No matching content found",
      });
      return {
        userMessage: {
          role: "user",
          content: userMessageText,
          embedding: queryEmbedding,
        },
        rejectQuery: true,
      };
    }

    logRequest({
      reqId,
      message: stripIndents`Chunks found: ${JSON.stringify(
        content.map(
          ({ embedding, chunkAlgoHash, ...wantedProperties }) =>
            wantedProperties
        )
      )}`,
    });

    const references = makeReferenceLinks(content);
    const includedContent = includeChunksForMaxTokensPossible({
      maxTokens: maxChunkContextTokens,
      content,
    });

    const userMessage = await makeUserMessage({
      content: includedContent,
      originalUserMessage: userMessageText,
      preprocessedUserMessage: preprocessedUserMessageContent,
      queryEmbedding,
      rejectQuery,
    });
    logRequest({
      reqId,
      message: `Latest message sent to LLM: ${JSON.stringify(userMessage)}`,
    });
    return {
      userMessage,
      references,
      rejectQuery: false,
    };
  };
}

interface PreProcessUserMessageParams {
  queryPreprocessor?: QueryPreprocessorFunc;
  userMessageText: string;
  conversation: Conversation;
  reqId: string;
}

async function preProcessUserMessage({
  queryPreprocessor,
  userMessageText,
  conversation,
  reqId,
}: PreProcessUserMessageParams): Promise<
  { query: string; rejectQuery?: boolean } | undefined
> {
  // Try to preprocess the user's message. If the user's message cannot be preprocessed
  // (likely due to LLM timeout), then we will just use the original message.
  if (!queryPreprocessor) {
    return undefined;
  }
  try {
    const { query, rejectQuery } = await queryPreprocessor({
      query: userMessageText,
      messages: conversation.messages,
    });
    logRequest({
      reqId,
      message: stripIndents`Successfully preprocessed user query.
      Original query: ${userMessageText}
      Preprocessed query: ${query}`,
    });
    return { query: query ?? userMessageText, rejectQuery };
  } catch (err: unknown) {
    logRequest({
      reqId,
      type: "error",
      message: `Error preprocessing query: ${JSON.stringify(
        err
      )}. Using original query: ${userMessageText}`,
    });
  }
}

/**
    The default reference format returns the following for chunks from _unique_ pages:

    ```js
    {
      title: chunk.metadata.pageTitle ?? chunk.url, // if title doesn't exist, just put url
      url: chunk.url // this always exists
    }
    ```
   */
export const makeDefaultReferenceLinks: MakeReferenceLinksFunc = (chunks) => {
  // Filter chunks with unique URLs
  const uniqueUrls = new Set();
  const uniqueChunks = chunks.filter((chunk) => {
    if (!uniqueUrls.has(chunk.url)) {
      uniqueUrls.add(chunk.url);
      return true; // Keep the chunk as it has a unique URL
    }
    return false; // Discard the chunk as its URL is not unique
  });

  return uniqueChunks.map((chunk) => {
    return {
      title: (chunk.metadata?.pageTitle as string) ?? chunk.url,
      url: chunk.url,
    };
  });
};

/**
      This function returns the chunks that can fit in the maxTokens.
      It limits the number of tokens that are sent to the LLM.
      */
export function includeChunksForMaxTokensPossible({
  maxTokens,
  content,
}: {
  maxTokens: number;
  content: EmbeddedContent[];
}): EmbeddedContent[] {
  let total = 0;
  const fitRangeEndIndex = content.findIndex(
    ({ tokenCount }) => (total += tokenCount) > maxTokens
  );
  return fitRangeEndIndex === -1 ? content : content.slice(0, fitRangeEndIndex);
}
