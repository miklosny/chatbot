import { strict as assert } from "assert";
import request from "supertest";
import "dotenv/config";
import {
  OpenAiChatClient,
  MongoDB,
  makeOpenAiEmbedFunc,
  assertEnvVars,
  CORE_ENV_VARS,
  EmbeddedContentStore,
  DatabaseConnection,
  EmbeddedContent,
  makeDatabaseConnection,
  makeMemoryDbServer,
  DbServer,
} from "chat-core";
import { ASSISTANT_PROMPT } from "../../aiConstants";
import {
  conversationConstants,
  Conversation,
  ConversationsService,
  Message,
} from "../../services/conversations";
import express from "express";
import {
  AddMessageRequestBody,
  addMessagesToDatabase,
  makeAddMessageToConversationRoute,
  convertDbMessageToOpenAiMessage,
  generateFurtherReading,
  validateApiConversationFormatting,
  getContentForText,
} from "./addMessageToConversation";
import { makeCreateConversationRoute } from "./createConversation";
import { ApiConversation, ApiMessage } from "./utils";
import { OpenAiLlmProvider } from "../../services/llm";
import { DataStreamerService } from "../../services/dataStreamer";
import { stripIndent } from "common-tags";
import { ObjectId } from "mongodb";
import { makeRateMessageRoute } from "./rateMessage";

jest.setTimeout(100000);

let memoryDbServer: DbServer | undefined;

beforeAll(async () => {
  memoryDbServer = await makeMemoryDbServer();
});

afterAll(async () => {
  await memoryDbServer?.stop();
});

describe("Conversations Router", () => {
  const {
    MONGODB_DATABASE_NAME,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_EMBEDDING_MODEL_VERSION,
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  } = assertEnvVars(CORE_ENV_VARS);

  // create route with mock service
  describe("POST /conversations/", () => {
    const app = express();
    app.use(express.json()); // for parsing application/json
    const testDbName = `conversations-test-${Date.now()}`;

    let mongodb: MongoDB | undefined;
    let conversations: ConversationsService | undefined;
    beforeAll(async () => {
      assert(memoryDbServer);
      const { connectionUri } = memoryDbServer;
      mongodb = new MongoDB(connectionUri, testDbName);
      conversations = new ConversationsService(mongodb.db);
      app.post(
        "/conversations/",
        makeCreateConversationRoute({ conversations })
      );
    });

    afterAll(async () => {
      await mongodb?.db.dropDatabase();
      await mongodb?.close();
    });

    it("should respond with 200 and create a conversation", async () => {
      const before = Date.now();
      const res = await request(app).post("/conversations/").send();
      const conversation: ApiConversation = res.body;
      const [assistantMessage] = conversation.messages;
      expect(res.statusCode).toEqual(200);

      expect(conversation.messages).toHaveLength(1);
      expect(typeof assistantMessage.id).toBe("string");
      expect(assistantMessage.content).toBe(ASSISTANT_PROMPT.content);
      expect(assistantMessage.role).toBe(ASSISTANT_PROMPT.role);
      expect(assistantMessage.rating).toBe(undefined);
      expect(assistantMessage.createdAt).toBeGreaterThan(before);
      const count = await mongodb?.db
        .collection("conversations")
        .countDocuments();
      expect(count).toBe(1);
    });
  });

  describe("POST /conversations/:conversationId/messages", () => {
    const endpointUrl = "/conversations/:conversationId/messages/";
    const app = express();
    app.use(express.json()); // for parsing application/json
    // set up conversations service
    const conversationMessageTestDbName = `convo-msg-test-${Date.now()}`;

    let store: (EmbeddedContentStore & DatabaseConnection) | undefined;

    let conversationsMongoDb: MongoDB | undefined;

    beforeAll(async () => {
      assert(memoryDbServer);
      const { connectionUri } = memoryDbServer;

      store = await makeDatabaseConnection({
        connectionUri,
        databaseName: MONGODB_DATABASE_NAME,
      });

      conversationsMongoDb = new MongoDB(
        connectionUri,
        conversationMessageTestDbName
      );
      const conversations = new ConversationsService(conversationsMongoDb.db);

      app.post(
        "/conversations/:conversationId/messages/",
        makeAddMessageToConversationRoute({
          conversations,
          store,
          embed,
          llm,
          dataStreamer,
        })
      );
      // For set up. Need to create conversation before can add to it.
      app.post(
        "/conversations/",
        makeCreateConversationRoute({ conversations })
      );
    });

    afterAll(async () => {
      await conversationsMongoDb?.db.dropDatabase();
      await conversationsMongoDb?.close();
      await store?.close();
    });

    // set up embeddings service
    const embed = makeOpenAiEmbedFunc({
      apiKey: OPENAI_API_KEY,
      apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
      baseUrl: OPENAI_ENDPOINT,
      deployment: OPENAI_EMBEDDING_DEPLOYMENT,
    });

    // set up llm service
    const llm = new OpenAiLlmProvider(
      new OpenAiChatClient(
        OPENAI_ENDPOINT,
        OPENAI_CHAT_COMPLETION_DEPLOYMENT,
        OPENAI_API_KEY
      )
    );

    // set up data streamer
    // TODO: make real data streamer
    const dataStreamer = new DataStreamerService();

<<<<<<< HEAD
=======
    app.post(
      endpointUrl,
      makeAddMessageToConversationRoute({
        conversations,
        content,
        embeddings,
        llm,
        dataStreamer,
      })
    );
    // For set up. Need to create conversation before can add to it.
    app.post("/conversations/", makeCreateConversationRoute({ conversations }));
>>>>>>> e2929c9 (full draft of changes)
    let _id: string;
    beforeEach(async () => {
      const createConversationRes = await request(app)
        .post("/conversations/")
        .send();
      const res: ApiConversation = createConversationRes.body;
      _id = res._id;
    });

    describe("Awaited response", () => {
      it("should respond with 200, add messages to the conversation, and respond", async () => {
        const requestBody: AddMessageRequestBody = {
          message:
            "how can i use mongodb products to help me build my new mobile app?",
        };
        const res = await request(app)
          .post(endpointUrl.replace(":conversationId", _id))
          .send(requestBody);
        const message: ApiMessage = res.body;
        expect(res.statusCode).toEqual(200);
        expect(message.role).toBe("assistant");
        expect(message.content).toContain("Realm");
        const request2Body: AddMessageRequestBody = {
          message: stripIndent`i'm want to learn more about this Realm thing. a few questions:
            can i use realm with javascript?
            where does realm save data? in the cloud?
            `,
        };
        const res2 = await request(app)
          .post(endpointUrl.replace(":conversationId", _id))
          .send(request2Body);
        const message2: ApiMessage = res2.body;
        expect(res2.statusCode).toEqual(200);
        expect(message2.role).toBe("assistant");
        expect(message2.content).toContain("Realm");
        const conversationInDb = await conversationsMongoDb?.db
          .collection<Conversation>("conversations")
          .findOne({
            _id: new ObjectId(_id),
          });
        expect(conversationInDb?.messages).toHaveLength(6); // system, assistant, user, assistant, user, assistant
      });
    });

    describe.skip("Streamed response", () => {
      // TODO: (DOCSP-30620) add in when data streamer is implemented
    });
    describe.skip("Error handing", () => {
      // TODO: (DOCSP-30945) add in soon. just not including in DOCSP-30616 so that we can build on top of it
    });

    describe("Edge cases", () => {
      describe("No content for user message", () => {
        const conversationMessageTestDbName = `convo-msg-test-${Date.now()}`;
        const conversationsMongoDb = new MongoDB(
          MONGODB_CONNECTION_URI!,
          conversationMessageTestDbName
        );
        const conversations = new ConversationsService(conversationsMongoDb.db);
        let conversationId: ObjectId;
        beforeAll(async () => {
          const { _id } = await conversations.create({
            ipAddress: "<NOT CAPTURING IP ADDRESS YET>",
          });
          conversationId = _id;
        });
        afterAll(async () => {
          await conversationsMongoDb.db.dropDatabase();
          await conversationsMongoDb.close();
        });

        const app = express();
        app.use(express.json());
        app.post(
          endpointUrl,
          makeAddMessageToConversationRoute({
            conversations,
            content,
            embeddings,
            llm,
            dataStreamer,
          })
        );
        test("Should respond with 200 and static response", async () => {
          const nonsenseMessage =
            "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikol";
          const response = await request(app)
            .post(
              endpointUrl.replace(":conversationId", conversationId.toString())
            )
            .send({ message: nonsenseMessage });
          expect(response.statusCode).toBe(200);

          expect(response.body.content).toEqual(
            conversationConstants.NO_RELEVANT_CONTENT
          );
        });
        describe("LLM not available but vector search is", () => {
          const brokenLLmService = new OpenAiLlmProvider(
            new OpenAiChatClient(
              OPENAI_ENDPOINT!,
              OPENAI_CHAT_COMPLETION_DEPLOYMENT!,
              "definitelyNotARealApiKey"
            )
          );
          const app = express();
          app.use(express.json());
          app.post(
            endpointUrl,
            makeAddMessageToConversationRoute({
              conversations,
              content,
              embeddings,
              llm: brokenLLmService,
              dataStreamer,
            })
          );
          test("should respond with 200, static message, and vector search results", async () => {
            const messageThatHasSearchResults = "Why use MongoDB?";
            const response = await request(app)
              .post(
                endpointUrl.replace(
                  ":conversationId",
                  conversationId.toString()
                )
              )
              .send({ message: messageThatHasSearchResults });
            expect(response.statusCode).toBe(200);
            expect(
              response.body.content.startsWith(
                conversationConstants.LLM_NOT_WORKING
              )
            ).toBe(true);
            const markdownLinkRegex =
              /\[\w+.*\]\(https?:\/\/.*\?tck=docs_chatbot\)/g;
            console.log(response.body.content);
            expect(markdownLinkRegex.test(response.body.content)).toBe(true);
          });
        });
      });

      describe("Utility functions", () => {
        describe("addMessagesToDatabase()", () => {
          const conversationMessageTestDbName = `convo-msg-test-${Date.now()}`;
          const conversationsMongoDb = new MongoDB(
            MONGODB_CONNECTION_URI!,
            conversationMessageTestDbName
          );
          const conversations = new ConversationsService(
            conversationsMongoDb.db
          );
          let conversationId: ObjectId;
          beforeAll(async () => {
            const { _id } = await conversations.create({
              ipAddress: "someIpAddress",
            });
            conversationId = _id;
          });
          afterAll(async () => {
            await conversationsMongoDb.db.dropDatabase();
            await conversationsMongoDb.close();
          });
          test("Should add messages to the database", async () => {
            const userMessageContent = "hello";
            const assistantMessageContent = "hi";
            const { userMessage, assistantMessage } =
              await addMessagesToDatabase({
                conversationId,
                userMessageContent,
                assistantMessageContent,
                conversations,
              });
            expect(userMessage.content).toBe(userMessageContent);
            expect(assistantMessage.content).toBe(assistantMessageContent);
            const conversationInDb = await conversations.findById({
              _id: conversationId,
            });
            expect(
              conversationInDb?.messages.find(
                ({ role, content }) =>
                  role === "user" && content === userMessageContent
              )
            ).toBeDefined();
            expect(
              conversationInDb?.messages.find(
                ({ role, content }) =>
                  role === "assistant" && content === assistantMessageContent
              )
            );
          });
        });
        test("convertDbMessageToOpenAiMessage()", () => {
          const sampleDbMessage: Message = {
            id: new ObjectId(),
            content: "hello",
            role: "user",
            createdAt: new Date(),
            rating: true,
          };

          const sampleApiMessage =
            convertDbMessageToOpenAiMessage(sampleDbMessage);
          expect(sampleApiMessage).toStrictEqual({
            content: sampleDbMessage.content,
            role: sampleDbMessage.role,
          });
        });

        describe("getContentForText()", () => {
          const ipAddress = "someIpAddress";
          test("Should return content for relevant text", async () => {
            const text = "MongoDB Atlas";

            const chunks = await getContentForText({
              embeddings,
              text,
              content,
              ipAddress,
            });
            expect(chunks).toBeDefined();
            expect(chunks.length).toBeGreaterThan(0);
          });
          test("Should not return content for irrelevant text", async () => {
            const text =
              "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikol";
            const chunks = await getContentForText({
              embeddings,
              text,
              content,
              ipAddress,
            });
            expect(chunks).toBeDefined();
            expect(chunks.length).toBe(0);
          });
        });
        describe("generateFurtherReading()", () => {
          // Chunk 1 and 2 are the same page. Chunk 3 is a different page.
          const chunk1 = {
            _id: new ObjectId(),
            url: "https://mongodb.com/docs/realm/sdk/node/",
            text: "blah blah blah",
            numTokens: 100,
            embedding: [0.1, 0.2, 0.3],
            lastUpdated: new Date(),
            site: {
              name: "MongoDB Realm",
              url: "https://mongodb.com/docs/realm/",
            },
          };
          const chunk2 = {
            _id: new ObjectId(),
            url: "https://mongodb.com/docs/realm/sdk/node/",
            text: "blah blah blah",
            numTokens: 100,
            embedding: [0.1, 0.2, 0.3],
            lastUpdated: new Date(),
            site: {
              name: "MongoDB Realm",
              url: "https://mongodb.com/docs/realm/",
            },
          };
          const chunk3 = {
            _id: new ObjectId(),
            url: "https://mongodb.com/docs/realm/sdk/node/xyz",
            text: "blah blah blah",
            numTokens: 100,
            embedding: [0.1, 0.2, 0.3],
            lastUpdated: new Date(),
            site: {
              name: "MongoDB Realm",
              url: "https://mongodb.com/docs/realm/",
            },
          };
          const tck = "?tck=docs_chatbot";
          test("No sources should return empty string", () => {
            const noChunks: Content[] = [];
            const noFurtherReading = generateFurtherReading({
              chunks: noChunks,
            });
            expect(noFurtherReading).toEqual("");
          });
          test("One source should return one link", () => {
            const oneChunk: Content[] = [chunk1];
            const oneFurtherReading = generateFurtherReading({
              chunks: oneChunk,
            });
            const url = oneChunk[0].url;
            const expectedOneFurtherReading = `\n\nFurther Reading:\n[${url}](${url}${tck})\n\n`;
            expect(oneFurtherReading).toEqual(expectedOneFurtherReading);
          });
          test("Multiple sources from same page should return one link", () => {
            const twoChunksSamePage: Content[] = [chunk1, chunk2];
            const oneFurtherReadingSamePage = generateFurtherReading({
              chunks: twoChunksSamePage,
            });
            const url = twoChunksSamePage[0].url;
            const expectedOneFurtherReadingSamePage = `\n\nFurther Reading:\n[${url}](${url}${tck})\n\n`;
            expect(oneFurtherReadingSamePage).toEqual(
              expectedOneFurtherReadingSamePage
            );
          });
          test("Multiple sources from different pages should return 1 link per page", () => {
            const twoChunksDifferentPage: Content[] = [chunk1, chunk3];
            const multipleFurtherReadingDifferentPage = generateFurtherReading({
              chunks: twoChunksDifferentPage,
            });
            const [url1, url2] = [
              twoChunksDifferentPage[0].url,
              twoChunksDifferentPage[1].url,
            ];
            const expectedMultipleFurtherReadingDifferentPage = `\n\nFurther Reading:\n[${url1}](${url1}${tck})\n[${url2}](${url2}${tck})\n\n`;
            expect(multipleFurtherReadingDifferentPage).toEqual(
              expectedMultipleFurtherReadingDifferentPage
            );
            // All three sources. Two from the same page. One from a different page.
            const threeChunks: Content[] = [chunk1, chunk2, chunk3];
            const multipleSourcesWithSomePageOverlap = generateFurtherReading({
              chunks: threeChunks,
            });
            const [otherUrl1, otherUrl2] = [
              threeChunks[0].url,
              threeChunks[2].url,
            ];
            const expectedMultipleSourcesWithSomePageOverlap = `\n\nFurther Reading:\n[${otherUrl1}](${otherUrl1}${tck})\n[${otherUrl2}](${otherUrl2}${tck})\n\n`;
            expect(multipleSourcesWithSomePageOverlap).toEqual(
              expectedMultipleSourcesWithSomePageOverlap
            );
          });
        });
        describe("validateApiConversationFormatting()", () => {
          test("Should validate correctly formatted conversation", () => {
            const correctlyFormattedConversation: ApiConversation = {
              _id: new ObjectId().toHexString(),
              messages: [
                {
                  content: "hi",
                  role: "assistant",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
                {
                  content: "hello",
                  role: "user",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
                {
                  content: "bye",
                  role: "assistant",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
                {
                  content: "good bye",
                  role: "user",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
              ],
              createdAt: Date.now(),
            };
            const validation = validateApiConversationFormatting({
              conversation: correctlyFormattedConversation,
            });
            expect(validation).toBe(true);
          });
          test("Should not validate empty conversation", () => {
            const emptyConversation: ApiConversation = {
              _id: new ObjectId().toHexString(),
              messages: [],
              createdAt: Date.now(),
            };
            const validation = validateApiConversationFormatting({
              conversation: emptyConversation,
            });
            expect(validation).toBe(false);
          });
          test("Should not validate odd number of messages", () => {
            const oddNumberOfMessages: ApiConversation = {
              _id: new ObjectId().toHexString(),
              messages: [
                {
                  content: "hi",
                  role: "assistant",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
                {
                  content: "hello",
                  role: "user",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
                {
                  content: "bye",
                  role: "assistant",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
              ],
              createdAt: Date.now(),
            };
            const validation = validateApiConversationFormatting({
              conversation: oddNumberOfMessages,
            });
            expect(validation).toBe(false);
          });
          test("Should not validate incorrect conversation order", () => {
            const incorrectConversationOrder: ApiConversation = {
              _id: new ObjectId().toHexString(),
              messages: [
                {
                  content: "hi",
                  role: "assistant",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
                {
                  content: "bye",
                  role: "assistant",
                  createdAt: Date.now(),
                  id: new ObjectId().toHexString(),
                },
              ],
              createdAt: Date.now(),
            };
            const validation = validateApiConversationFormatting({
              conversation: incorrectConversationOrder,
            });
            expect(validation).toBe(false);
          });
        });
      });
    });
  });
  describe("POST /conversations/:conversationId/messages/:messageId/rating", () => {
    const app = express();
    app.use(express.json()); // for parsing application/json

    const testDbName = `conversations-test-${Date.now()}`;
    const ipAddress = "<NOT CAPTURING IP ADDRESS YET>";

    let mongodb: MongoDB | undefined;
    let conversations: ConversationsService | undefined;
    let conversation: Conversation;
    let testMsg: Message;

    beforeAll(async () => {
      assert(memoryDbServer);
      mongodb = new MongoDB(memoryDbServer.connectionUri, testDbName);
      conversations = new ConversationsService(mongodb.db);

      app.post(
        "/conversations/:conversationId/messages/:messageId/rating",
        makeRateMessageRoute({ conversations })
      );
      conversation = await conversations.create({ ipAddress });
      testMsg = await conversations.addConversationMessage({
        conversationId: conversation._id,
        content: "hello",
        role: "assistant",
      });
    });

    afterAll(async () => {
      await mongodb?.db.dropDatabase();
      await mongodb?.close();
    });
    test("Should return 204 for valid rating", async () => {
      const response = await request(app)
        .post(
          `/conversations/${conversation._id}/messages/${testMsg.id}/rating`
        )
        .send({ rating: true });

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
      assert(conversations);
      const updatedConversation = await conversations.findById({
        _id: conversation._id,
      });
      expect(
        updatedConversation.messages[updatedConversation.messages.length - 1]
          .rating
      ).toBe(true);
    });
    test("Should return 400 for invalid conversation ID", async () => {
      const response = await request(app)
        .post(
          `/conversations/123/messages/${conversation.messages[0].id}/rating`
        )
        .send({ rating: true });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid conversation ID",
      });
    });
    test("Should return 400 for invalid message ID", async () => {
      const response = await request(app)
        .post(`/conversations/${testMsg.id}/messages/123/rating`)
        .send({ rating: true });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid message ID",
      });
    });
    test("Should return 404 for conversation not in DB", async () => {
      const response = await request(app)
        .post(
          `/conversations/${new ObjectId().toHexString()}/messages/${
            testMsg.id
          }/rating`
        )
        .send({ rating: true });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: "Conversation not found",
      });
    });
    test("Should return 404 for message not in conversation", async () => {
      const response = await request(app)
        .post(
          `/conversations/${
            conversation._id
          }/messages/${new ObjectId().toHexString()}/rating`
        )
        .send({ rating: true });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: "Message not found",
      });
    });
    // TODO:(DOCSP-30843) when properly configure IP address capture and validation,
    // this test will need to be refactored.
    describe("IP address validation", () => {
      beforeEach(async () => {
        const ipAddress = "abc.123.xyz.456";
        assert(conversations);
        conversation = await conversations.create({ ipAddress });
        testMsg = await conversations.addConversationMessage({
          conversationId: conversation._id,
          content: "hello",
          role: "assistant",
        });
      });

      afterAll(async () => {
        await mongodb.db.dropDatabase();
        await mongodb.close();
      });
      test("Should return 204 for valid rating", async () => {
        const response = await request(app)
          .post(
            `/conversations/${conversation._id}/messages/${testMsg.id}/rating`
          )
          .send({ rating: true });

        expect(response.statusCode).toBe(204);
        expect(response.body).toEqual({});
        const updatedConversation = await conversations.findById({
          _id: conversation._id,
        });
        expect(
          updatedConversation.messages[updatedConversation.messages.length - 1]
            .rating
        ).toBe(true);
      });
      test("Should return 400 for invalid conversation ID", async () => {
        const response = await request(app)
          .post(
            `/conversations/123/messages/${conversation.messages[0].id}/rating`
          )
          .send({ rating: true });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          error: "Invalid conversation ID",
        });
      });
      test("Should return 400 for invalid message ID", async () => {
        const response = await request(app)
          .post(`/conversations/${testMsg.id}/messages/123/rating`)
          .send({ rating: true });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          error: "Invalid message ID",
        });
      });
      test("Should return 404 for conversation not in DB", async () => {
        const response = await request(app)
          .post(
            `/conversations/${new ObjectId().toHexString()}/messages/${
              testMsg.id
            }/rating`
          )
          .send({ rating: true });

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          error: "Conversation not found",
        });
      });
      test("Should return 404 for message not in conversation", async () => {
        const response = await request(app)
          .post(
            `/conversations/${
              conversation._id
            }/messages/${new ObjectId().toHexString()}/rating`
          )
          .send({ rating: true });

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          error: "Message not found",
        });
      });
      // TODO:(DOCSP-30843) when properly configure IP address capture and validation,
      // this test will need to be refactored.
      describe("IP address validation", () => {
        beforeEach(async () => {
          const ipAddress = "abc.123.xyz.456";
          conversation = await conversations.create({ ipAddress });
          testMsg = await conversations.addConversationMessage({
            conversationId: conversation._id,
            content: "hi",
            role: "user",
          });
        });
        test("Should return 403 for invalid IP address", async () => {
          const response = await request(app)
            .post(
              `/conversations/${conversation._id}/messages/${testMsg.id}/rating`
            )
            .send({ rating: true });

          expect(response.statusCode).toBe(403);
          expect(response.body).toEqual({
            error: "Invalid IP address for conversation",
          });
        });
      });
    });
  });
});
