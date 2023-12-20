import { ObjectId, References } from "mongodb-rag-core";
import { FunctionCall } from "@azure/openai";
import { OpenAiMessageRole } from "./ChatLlm";

export type Message = {
  /**
    Unique identifier for the message.
   */
  id: ObjectId;

  /**
    The role of the message in the conversation.
   */
  role: OpenAiMessageRole;

  /**
    Message that occurs in the conversation.
   */
  content: string;

  /**
    The date the message was created.
   */
  createdAt: Date;

  /**
    Custom data to include in the Message persisted to the database.
   */
  customData?: Record<string, unknown>;
};

export type SystemMessage = Message & {
  role: "system";
};

export type AssistantMessage = Message & {
  role: "assistant";

  /**
    Set to `true` if the user liked the response, `false` if the user didn't
    like the response. No value if user didn't rate the response. Note that only
    messages with `role: "assistant"` can be rated.
   */
  rating?: boolean;

  /**
    Further reading links for the message.
   */
  references?: References;

  functionCall?: FunctionCall;
};

export type FunctionMessage = Message & {
  role: "function";
  name: string;
};

export type UserMessage = Message & {
  role: "user";

  /**
    The preprocessed content of the message that is sent to vector search.
   */
  preprocessedContent?: string;

  /**
    Whether preprocessor suggested not to answer based on the input.
   */
  rejectQuery?: boolean;

  /**
    The vector representation of the message content.
   */
  embedding: number[];
};

/**
  Message in the {@link Conversation} as stored in the database.
 */
export type SomeMessage =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | FunctionMessage;

export type ConversationCustomData = Record<string, unknown> | undefined;

/**
  Conversation between the user and the chatbot as stored in the database.
 */
export interface Conversation<
  CustomData extends ConversationCustomData = ConversationCustomData
> {
  _id: ObjectId;
  /** Messages in the conversation. */
  messages: SomeMessage[];
  /** The date the conversation was created. */
  createdAt: Date;
  /** The hostname that the request originated from. */
  requestOrigin?: string;

  /**
    Custom data to include in the Conversation persisted to the database.
    You can pass this data to the {@link ConversationsService.create()} method.
   */
  customData?: CustomData;
}
export type CreateConversationParams = {
  customData?: ConversationCustomData;
};

export type AddSystemMessageParams = Omit<SystemMessage, "id" | "createdAt">;

export type AddUserMessageParams = Omit<UserMessage, "id" | "createdAt"> & {
  customData?: Record<string, unknown>;
};

export type AddFunctionMessageParams = Omit<
  FunctionMessage,
  "id" | "createdAt"
> & {
  customData?: Record<string, unknown>;
};

export type AddAssistantMessageParams = Omit<
  AssistantMessage,
  "id" | "createdAt"
>;

export type AddSomeMessageParams =
  | AddSystemMessageParams
  | AddUserMessageParams
  | AddAssistantMessageParams
  | AddFunctionMessageParams;

export type AddConversationMessageParams = {
  conversationId: ObjectId;
  message: AddSomeMessageParams;
};

export type AddManyConversationMessagesParams = {
  conversationId: ObjectId;
  messages: AddSomeMessageParams[];
};
export interface FindByIdParams {
  _id: ObjectId;
}
export interface RateMessageParams {
  conversationId: ObjectId;
  messageId: ObjectId;
  rating: boolean;
}

/**
  Static responses to send in pre-defined edge case scenarios.
 */
export interface ConversationConstants {
  /**
    Response message sent when the user sends a message that the chatbot
    that doesn't match anything in the chatbot's knowledge base.
   */
  NO_RELEVANT_CONTENT: string;
  /**
    Response message sent when the chatbot's LLM is not working.
   */
  LLM_NOT_WORKING: string;
}
/**
  Service for managing {@link Conversation}s.
 */
export interface ConversationsService {
  conversationConstants: ConversationConstants;

  /**
    Create a new {@link Conversation}.
   */
  create: (params?: CreateConversationParams) => Promise<Conversation>;

  /**
    Add a {@link Message} to a {@link Conversation}.
   */
  addConversationMessage: (
    params: AddConversationMessageParams
  ) => Promise<Message>;
  /**
    Add multiple {@link Message} objects to a {@link Conversation}.
   */
  addManyConversationMessages: (
    params: AddManyConversationMessagesParams
  ) => Promise<Message[]>;
  findById: ({ _id }: FindByIdParams) => Promise<Conversation | null>;

  /**
    Rate a {@link Message} in a {@link Conversation}.
   */
  rateMessage: ({
    conversationId,
    messageId,
    rating,
  }: RateMessageParams) => Promise<boolean>;
}

export const defaultConversationConstants: ConversationConstants = {
  NO_RELEVANT_CONTENT: `Unfortunately, I do not know how to respond to your message.

Please try to rephrase your message. Adding more details can help me respond with a relevant answer.`,
  LLM_NOT_WORKING: `Unfortunately, my chat functionality is not working at the moment,
so I cannot respond to your message. Please try again later.

However, here are some links that might provide some helpful information for your message:`,
};
