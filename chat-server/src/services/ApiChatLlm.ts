import { GetChatCompletionsOptions } from "@azure/openai";
import { OpenAiChatMessage } from "./ChatLlm";
import { HttpApiCredentials, HttpRequestArgs } from "./HttpRequestArgs";

export interface ApiChatLlmAnswerAwaitedParams {
  messages: OpenAiChatMessage[];
  query?: string;
  options?: GetChatCompletionsOptions;
  staticHttpRequestArgs?: HttpRequestArgs;
  apiCredentials: HttpApiCredentials;
}
/**
  LLM service to interact with HTTP API.
 */
export interface ApiChatLlm {
  baseSystemPrompt: string;
  answerAwaited(params: ApiChatLlmAnswerAwaitedParams): Promise<{
    newMessages: OpenAiChatMessage[];
  }>;
}