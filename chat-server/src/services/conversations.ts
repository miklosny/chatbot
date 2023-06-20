import { ObjectId, Db, Collection } from "mongodb";
import { mongodb } from "../integrations/mongodb";
import {
  OpenAiChatMessage,
  SYSTEM_PROMPT,
  ASSISTANT_PROMPT,
  OpenAiMessageRole,
} from "../integrations/openai";

export interface Message {
  /** Unique identifier for the message. */
  id: ObjectId;
  /** The role of the message in the context of the conversation. */
  role: string;
  /** Markdown-formatted response to user's chat message in the context of the conversation. */
  content: string;
  /** Set to `true` if the user liked the response, `false` if the user didn't like the response. No value if user didn't rate the response. Note that only messages with `role: "assistant"` can be rated. */
  rating?: boolean;
  /** The date the message was created. */
  timeCreated: Date;
}

export interface Conversation {
  _id: ObjectId;
  /** Messages in the conversation. */
  messages: Message[];
  /** The IP address of the user performing the conversation. */
  ipAddress: string;
  /** The date the conversation was created. */
  timeCreated: Date;
}
export interface CreateConversationParams {
  ipAddress: string;
}
export interface AddMessageParams {
  conversationId: ObjectId;
  content: string;
}
export interface FindByIdParams {
  _id: ObjectId;
}
export interface RateMessageParams {
  conversationId: ObjectId;
  messageId: ObjectId;
  rating: boolean;
  role?: OpenAiMessageRole;
}
export interface ConversationsServiceInterface {
  create: ({ ipAddress }: CreateConversationParams) => Promise<Conversation>;
  addUserMessage: ({
    conversationId,
    content,
  }: AddMessageParams) => Promise<boolean>;
  findById: ({ _id }: FindByIdParams) => Promise<Conversation | null>;
  rateMessage: ({
    conversationId,
    messageId,
    rating,
  }: RateMessageParams) => Promise<boolean>;
}

export class ConversationsService implements ConversationsServiceInterface {
  private database: Db;
  private conversationsCollection: Collection<Conversation>;
  constructor(database: Db) {
    this.database = database;
    this.conversationsCollection =
      this.database.collection<Conversation>("conversations");
  }
  async create({ ipAddress }: CreateConversationParams) {
    const newConversation = {
      _id: new ObjectId(),
      ipAddress,
      messages: [
        this.createMessageFromChatMessage(SYSTEM_PROMPT),
        this.createMessageFromChatMessage(ASSISTANT_PROMPT),
      ],
      timeCreated: new Date(),
    };
    const insertResult = await this.conversationsCollection.insertOne(
      newConversation
    );

    if (
      !insertResult.acknowledged ||
      insertResult.insertedId !== newConversation._id
    ) {
      throw new Error("Failed to insert conversation");
    }
    return newConversation;
  }

  async addUserMessage({ conversationId, content }: AddMessageParams) {
    const newMessage = this.createMessageFromChatMessage({
      role: "user",
      content,
    });
    const updateResult = await this.conversationsCollection.updateOne(
      {
        _id: conversationId,
      },
      {
        $push: {
          messages: newMessage,
        },
      }
    );
    if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
      throw new Error("Failed to insert message");
    }
    return true;
  }

  async findById({ _id }: FindByIdParams) {
    const conversation = await this.conversationsCollection.findOne({ _id });
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    return conversation;
  }

  async rateMessage({
    conversationId,
    messageId,
    rating,
    role,
  }: RateMessageParams) {
    const updateResult = await this.conversationsCollection.updateOne(
      {
        _id: conversationId,
      },
      {
        $set: {
          "messages.$[message].rating": rating,
        },
      },
      {
        arrayFilters: [
          { "message.id": messageId, "message.role": role || "assistant" },
        ],
      }
    );
    if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
      throw new Error("Failed to rate message");
    }
    return true;
  }

  private createMessageFromChatMessage(
    chatMessage: OpenAiChatMessage
  ): Message {
    return {
      id: new ObjectId(),
      role: chatMessage.role,
      content: chatMessage.content,
      timeCreated: new Date(),
    };
  }
}

export const conversationsService = new ConversationsService(mongodb.db);
