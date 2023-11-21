import "dotenv/config";
import {
  Conversation,
  UserMessage,
  AssistantMessage,
  makeMongoDbConversationsService,
} from "./conversations";
import { BSON, MongoClient } from "mongodb-rag-core";
import { systemPrompt } from "../test/testHelpers";

const requestOrigin = "http://localhost:5173";

jest.setTimeout(100000);

describe("Conversations Service", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  if (!MONGODB_CONNECTION_URI) {
    throw new Error("Missing MONGODB_CONNECTION_URI");
  }
  const mongoClient = new MongoClient(MONGODB_CONNECTION_URI);

  const mongodb = mongoClient.db(`conversations-test-${new Date().getTime()}`); // New DB for each test run

  afterEach(async () => {
    await mongodb.collection("conversations").deleteMany({});
  });
  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongoClient.close();
  });

  const conversationsService = makeMongoDbConversationsService(
    mongodb,
    systemPrompt
  );
  test("Should create a conversation", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
      requestOrigin,
    });
    expect(conversation).toHaveProperty("_id");
    expect(conversation).toHaveProperty("ipAddress", ipAddress);
    const conversationInDb = await mongodb
      .collection("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toStrictEqual(conversation);
  });
  test("Should add a message to a conversation", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
      requestOrigin,
    });
    const content = "Tell me about MongoDB";
    const newMessage = await conversationsService.addConversationMessage({
      conversationId: conversation._id,
      role: "user",
      content,
      requestOrigin,
      embedding: [1, 2, 3],
    });
    expect(newMessage.content).toBe(content);

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(2);
    expect(conversationInDb?.messages[1].content).toStrictEqual(content);
  });
  test("Should add a message to a conversation with optional fields", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
    });
    const content = "Tell me about MongoDB";
    const preprocessedContent = "<preprocessed> Tell me about MongoDB";
    const embedding = [1, 2, 3];
    const newMessage = await conversationsService.addConversationMessage({
      conversationId: conversation._id,
      role: "user",
      content,
      preprocessedContent,
      embedding,
      requestOrigin,
    });
    expect(newMessage.content).toBe(content);

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(2);
    expect(conversationInDb?.messages[1].content).toStrictEqual(content);
    expect(
      (conversationInDb?.messages[1] as UserMessage)?.preprocessedContent
    ).toStrictEqual(preprocessedContent);
    expect(
      (conversationInDb?.messages[1] as UserMessage)?.embedding
    ).toStrictEqual(embedding);
  });
  test("Should find a conversation by id", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
      requestOrigin,
    });
    const conversationInDb = await conversationsService.findById({
      _id: conversation._id,
    });
    expect(conversationInDb).toStrictEqual(conversation);
  });
  test("Should return null if cannot find a conversation by id", async () => {
    const conversationInDb = await conversationsService.findById({
      _id: new BSON.ObjectId(),
    });
    expect(conversationInDb).toBeNull();
  });
  test("Should rate a message", async () => {
    const ipAddress = new BSON.UUID().toString();
    const { _id: conversationId } = await conversationsService.create({
      ipAddress,
    });

    await conversationsService.addConversationMessage({
      conversationId,
      role: "user",
      content: "What is the MongoDB Document Model?",
      embedding: [1, 2, 3],
      requestOrigin,
    });

    const assistantMessage = await conversationsService.addConversationMessage({
      conversationId,
      role: "assistant",
      content: "That's a good question! Let me explain...",
      references: [],
    });

    const result = await conversationsService.rateMessage({
      conversationId,
      messageId: assistantMessage.id,
      rating: true,
    });

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversationId });

    expect(result).toBe(true);
    expect((conversationInDb?.messages[2] as AssistantMessage)?.rating).toBe(
      true
    );
  });
});
