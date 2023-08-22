import { strict as assert } from "assert";
import frontmatter from "front-matter";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import GPT3Tokenizer from "gpt3-tokenizer";
import { EmbeddedContent, Page } from "chat-core";
import { updateFrontMatter, extractFrontMatter } from "chat-core";
import {
  chunkOpenApiSpecYaml,
  defaultOpenApiSpecYamlChunkOptions,
} from "./chunkOpenApiSpecYaml";

export type ContentChunk = Omit<EmbeddedContent, "embedding" | "updated">;

export type SomeTokenizer = {
  encode(text: string): {
    bpe: number[];
    text: string[];
  };
};

export type ChunkFunc = (
  page: Page,
  options?: Partial<ChunkOptions>
) => Promise<ContentChunk[]>;

export type ChunkTransformer = (
  chunk: Omit<ContentChunk, "tokenCount">,
  details: {
    page: Page;
  }
) => Promise<Omit<ContentChunk, "tokenCount">>;

export type ChunkMetadataGetter<
  T extends Record<string, unknown> = Record<string, unknown>
> = (args: {
  chunk: Omit<ContentChunk, "tokenCount">;

  page: Page;

  /**
    Previous metadata, if any. Omitting this from the return value should not
    overwrite previous metadata.
   */
  metadata?: T;

  /**
    The text of the chunk without metadata.
   */
  text: string;
}) => Promise<T>;

export type ChunkOptions = {
  chunkSize: number;
  chunkOverlap: number;
  tokenizer: SomeTokenizer;
  yamlChunkSize?: number;

  /**
    Transform to be applied to each chunk as it is produced.
    Provides the opportunity to prepend metadata, etc.
   */
  transform?: ChunkTransformer;
};

const defaultMdChunkOptions: ChunkOptions = {
  chunkSize: 600, // max chunk size of 600 tokens gets avg ~400 tokens/chunk
  chunkOverlap: 0,
  tokenizer: new GPT3Tokenizer({ type: "gpt3" }),
};

/**
  Returns chunked of a content page.
 */
export const chunkPage: ChunkFunc = async (
  page: Page,
  chunkOptions?: Partial<ChunkOptions>
): Promise<ContentChunk[]> => {
  switch (page.format) {
    case "openapi-yaml": {
      const chunks = await chunkOpenApiSpecYaml(page, {
        ...defaultOpenApiSpecYamlChunkOptions,
        ...chunkOptions,
        chunkSize:
          chunkOptions?.yamlChunkSize ??
          defaultOpenApiSpecYamlChunkOptions.chunkSize,
      });
      return chunks;
    }
    case "md": // fallthrough
    case "txt": // fallthrough
    default: {
      const chunks = await chunkMd(page, {
        ...defaultMdChunkOptions,
        ...chunkOptions,
      });
      return chunks;
    }
  }
};

export const chunkMd: ChunkFunc = async function (
  page: Page,
  optionsIn?: Partial<ChunkOptions>
) {
  const options = { ...defaultOpenApiSpecYamlChunkOptions, ...optionsIn };
  const { tokenizer, chunkSize, chunkOverlap, transform } = options;
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkOverlap,
    chunkSize,
    lengthFunction: (text) => tokenizer.encode(text).bpe.length,
  });

  const chunks = await splitter.createDocuments([page.body]);

  return await Promise.all(
    chunks.map(async ({ pageContent }, chunkIndex): Promise<ContentChunk> => {
      const preTransformChunk: Omit<ContentChunk, "tokenCount"> = {
        chunkIndex,
        sourceName: page.sourceName,
        url: page.url,
        text: pageContent,
      };
      const transformedChunk = transform
        ? await transform(preTransformChunk, { page })
        : preTransformChunk;

      const chunk = {
        ...transformedChunk,
        tokenCount: tokenizer.encode(transformedChunk.text).bpe.length,
      };
      const { metadata } = extractFrontMatter(transformedChunk.text);
      if (metadata) {
        chunk["metadata"] = metadata;
      }
      return chunk;
    })
  );
};

/**
  Create a function that adds or updates front matter metadata to the chunk
  text.
 */
export const makeChunkFrontMatterUpdater = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  getMetadata: ChunkMetadataGetter<T>
): ChunkTransformer => {
  return async (chunk, { page }) => {
    // Extract existing front matter, if any
    const frontMatterResult = frontmatter.test(chunk.text)
      ? frontmatter<T>(chunk.text)
      : undefined;
    const body = frontMatterResult?.body ?? chunk.text;

    // Construct new metadata object from existing front matter (if any) and
    // user-provided metadata function
    const metadata = {
      ...(frontMatterResult?.attributes ?? {}),
      ...(await getMetadata({
        chunk,
        page,
        metadata: frontMatterResult?.attributes,
        text: body,
      })),
    };

    // Update chunk with new front matter in yaml format
    return {
      ...chunk,
      text: updateFrontMatter(body, metadata),
    };
  };
};

/**
  Forms common metadata based on the chunk text, including info about any code
  examples in the text.
 */
export const standardMetadataGetter: ChunkMetadataGetter<{
  pageTitle?: string;
  hasCodeBlock: boolean;
  codeBlockLanguages?: string[];
  tags?: string[];
  [k: string]: unknown;
}> = async ({ page, text }) => {
  // Detect code blocks
  const mdCodeBlockToken = /```([A-z0-1-_]*)/;
  const codeBlockLanguages = Array.from(
    new Set(
      text
        .split("\n")
        .map((line) => mdCodeBlockToken.exec(line))
        .filter((match) => match !== null)
        .map((match) => {
          assert(match !== null);
          return match[1];
        })
    )
  );

  const metadata: Awaited<ReturnType<typeof standardMetadataGetter>> = {
    pageTitle: page.title,
    hasCodeBlock: codeBlockLanguages.length !== 0,
  };

  // Which code examples
  const specifiedLanguages = codeBlockLanguages.filter(
    (language) => language !== ""
  );

  if (specifiedLanguages.length) {
    metadata["codeBlockLanguages"] = specifiedLanguages;
  }

  return { ...(page.metadata ?? {}), ...metadata };
};

export const standardChunkFrontMatterUpdater = makeChunkFrontMatterUpdater(
  standardMetadataGetter
);
