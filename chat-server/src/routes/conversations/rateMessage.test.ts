import { strict as assert } from "assert";
import request from "supertest";
import "dotenv/config";
import { MongoDB } from "chat-core";
import {
  Conversation,
  Message,
  ConversationsService,
} from "../../services/conversations";
import { Express } from "express";
import { ObjectId } from "mongodb";
import { makeRateMessageRoute } from "./rateMessage";
import { CONVERSATIONS_API_V1_PREFIX } from "../../app";
import { makeConversationsRoutesDefaults } from "../../testHelpers";

jest.setTimeout(100000);

describe("POST /conversations/:conversationId/messages/:messageId/rating", () => {
  const endpointUrl =
    CONVERSATIONS_API_V1_PREFIX + "/:conversationId/messages/:messageId/rating";
  let app: Express;
  let conversations: ConversationsService;
  let conversation: Conversation;
  let testMsg: Message;
  let testEndpointUrl: string;
  let mongodb: MongoDB;
  let ipAddress: string;

  beforeAll(async () => {
    ({ mongodb, app, conversations, ipAddress } =
      await makeConversationsRoutesDefaults());
    app
      .post(endpointUrl, makeRateMessageRoute({ conversations }))
      .set("X-FORWARDED-FOR", ipAddress);
    conversation = await conversations.create({ ipAddress });
    testMsg = await conversations.addConversationMessage({
      conversationId: conversation._id,
      content: "hello",
      role: "assistant",
    });
    testEndpointUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(testMsg.id));
  });

  afterAll(async () => {
    await mongodb?.db.dropDatabase();
    await mongodb?.close();
  });

  test("Should return 204 for valid rating", async () => {
    const response = await request(app)
      .post(testEndpointUrl)
      .set("X-Forwarded-For", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(204);
    expect(response.body).toEqual({});
    assert(conversations);
    const updatedConversation = await conversations.findById({
      _id: conversation._id,
    });
    assert(updatedConversation);
    expect(
      updatedConversation.messages[updatedConversation.messages.length - 1]
        .rating
    ).toBe(true);
  });

  it("Should return 400 for invalid request bodies", async () => {
    const res1 = await request(app)
      .post(testEndpointUrl)
      .send({ rating: "blue" });
    expect(res1.statusCode).toEqual(400);

    const res2 = await request(app)
      .post(testEndpointUrl)
      .send({ ratingz: true });
    expect(res2.statusCode).toEqual(400);
  });
  test("Should return 400 for invalid conversation ID", async () => {
    const response = await request(app)
      .post(
        `${CONVERSATIONS_API_V1_PREFIX}/123/messages/${conversation.messages[0].id}/rating`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid conversation ID",
    });
  });
  test("Should return 400 for invalid message ID", async () => {
    const response = await request(app)
      .post(`${CONVERSATIONS_API_V1_PREFIX}/${testMsg.id}/messages/123/rating`)
      .set("X-FORWARDED-FOR", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid message ID",
    });
  });
  test("Should return 404 for conversation not in DB", async () => {
    const response = await request(app)
      .post(
        `${CONVERSATIONS_API_V1_PREFIX}/${new ObjectId().toHexString()}/messages/${
          testMsg.id
        }/rating`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Conversation not found",
    });
  });
  test("Should return 404 for message not in conversation", async () => {
    const response = await request(app)
      .post(
        `${CONVERSATIONS_API_V1_PREFIX}/${
          conversation._id
        }/messages/${new ObjectId().toHexString()}/rating`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Message not found",
    });
  });
  describe("IP address validation", () => {
    beforeEach(async () => {
      assert(conversations);

      conversation = await conversations.create({ ipAddress });
      testMsg = await conversations.addConversationMessage({
        conversationId: conversation._id,
        content: "hello",
        role: "assistant",
      });
    });
    test("Should return 403 for different but valid IP address", async () => {
      const differentIpAddress = "192.158.1.38";
      const response = await request(app)
        .post(
          `${CONVERSATIONS_API_V1_PREFIX}/${conversation._id}/messages/${testMsg.id}/rating`
        )
        .set("X-Forwarded-For", differentIpAddress)
        .send({ rating: true });

      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual({
        error: "Invalid IP address for conversation",
      });
    });
  });
});
