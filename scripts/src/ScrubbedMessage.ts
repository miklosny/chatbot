import { ObjectId } from "mongodb";
import { Message } from "chat-server";

export type ScrubbedMessage = Omit<
  Message,
  "content" | "preprocessedContent" | "id"
> & {
  /**
    The ID, which should match the ID of the original message within the
    conversation.
   */
  _id: ObjectId;

  /**
    The ID of the original conversation.
   */
  conversationId: ObjectId;

  /**
    The IP address of the user in the conversation.
   */
  ipAddress: string;

  /**
    The ordinal number of this message in relation to other messages in the original conversation.
   */
  index: number;

  /**
    A list of topics possibly covered by the original message.
   */
  topics?: string[];
};