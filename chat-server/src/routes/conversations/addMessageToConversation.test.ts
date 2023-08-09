import request from "supertest";
import "dotenv/config";
import {
  MongoDB,
  assertEnvVars,
  CORE_ENV_VARS,
  EmbeddedContentStore,
  EmbeddedContent,
  EmbedFunc,
  FindNearestNeighborsOptions,
} from "chat-core";
import {
  conversationConstants,
  Conversation,
  ConversationsService,
  Message,
  ConversationsServiceInterface,
} from "../../services/conversations";
import express, { Express } from "express";
import {
  AddMessageRequestBody,
  addMessagesToDatabase,
  makeAddMessageToConversationRoute,
  convertDbMessageToOpenAiMessage,
  generateReferences,
  validateApiConversationFormatting,
  getContentForText,
  MAX_INPUT_LENGTH,
  AddMessageToConversationRouteParams,
  MAX_MESSAGES_IN_CONVERSATION,
  createLinkReference,
} from "./addMessageToConversation";
import { ApiConversation, ApiMessage } from "./utils";
import { makeOpenAiLlm } from "../../services/llm";
import { makeDataStreamer } from "../../services/dataStreamer";
import { stripIndent } from "common-tags";
import { ObjectId } from "mongodb";
import { makeApp, CONVERSATIONS_API_V1_PREFIX } from "../../app";
import { makeConversationsRoutesDefaults } from "../../testHelpers";
import { config } from "../../config";
import { QueryPreprocessorFunc } from "../../processors/QueryPreprocessorFunc";

jest.setTimeout(100000);

describe("POST /conversations/:conversationId/messages", () => {
  let defaultRouteConfig: AddMessageToConversationRouteParams;
  let mongodb: MongoDB;
  let ipAddress: string;
  let embed: EmbedFunc;
  let dataStreamer: ReturnType<typeof makeDataStreamer>;
  let findNearestNeighborsOptions: Partial<FindNearestNeighborsOptions>;
  let store: EmbeddedContentStore;
  let conversations: ConversationsServiceInterface;
  let app: Express;

  beforeAll(async () => {
    ({
      ipAddress,
      embed,
      dataStreamer,
      findNearestNeighborsOptions,
      mongodb,
      store,
      conversations,
      app,
      appConfig: defaultRouteConfig,
    } = await makeConversationsRoutesDefaults());
  });

  afterAll(async () => {
    await mongodb?.db.dropDatabase();
    await mongodb?.close();
  });

  let conversationId: string;
  let testEndpointUrl: string;
  const endpointUrl = CONVERSATIONS_API_V1_PREFIX + "/:conversationId/messages";

  beforeEach(async () => {
    const createConversationRes = await request(app)
      .post(CONVERSATIONS_API_V1_PREFIX)
      .set("X-FORWARDED-FOR", ipAddress)
      .send();
    const res: ApiConversation = createConversationRes.body;
    conversationId = res._id;
    testEndpointUrl = endpointUrl.replace(":conversationId", conversationId);
  });

  describe("Awaited response", () => {
    it("should respond with 200, add messages to the conversation, and respond", async () => {
      const requestBody: AddMessageRequestBody = {
        message:
          "how can i use mongodb products to help me build my new mobile app?",
      };
      const res = await request(app)
        .post(testEndpointUrl)
        .set("X-FORWARDED-FOR", ipAddress)
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
        .post(endpointUrl.replace(":conversationId", conversationId))
        .send(request2Body);
      const message2: ApiMessage = res2.body;
      expect(res2.statusCode).toEqual(200);
      expect(message2.role).toBe("assistant");
      expect(message2.content).toContain("Realm");
      const conversationInDb = await mongodb?.db
        .collection<Conversation>("conversations")
        .findOne({
          _id: new ObjectId(conversationId),
        });
      expect(conversationInDb?.messages).toHaveLength(5); // system, user, assistant, user, assistant
    });
  });

  describe("Streamed response", () => {
    it("should respond with a 200 text/event-stream that streams the response & further reading references", async () => {
      const requestBody = {
        message:
          "how can i use mongodb products to help me build my new mobile app?",
      } satisfies AddMessageRequestBody;
      const res = await request(app)
        .post(
          endpointUrl.replace(":conversationId", conversationId) +
            "?stream=true"
        )
        .send(requestBody);
      expect(res.statusCode).toEqual(200);
      expect(res.header["content-type"]).toBe("text/event-stream");
      expect(res.text).toContain(`data: {"type":"delta","data":"`);
      expect(res.text).toContain(`data: {"type":"references","data":[{`);
      expect(res.text).toContain(`data: {"type":"finished","data":"`);
    });
  });

  describe("Error handing", () => {
    test("should respond 400 if invalid conversation ID", async () => {
      const notAValidId = "not-a-valid-id";
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", notAValidId))
        .set("X-FORWARDED-FOR", ipAddress)
        .send({
          message: "hello",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toStrictEqual({
        error: "Invalid conversation ID",
      });
    });

    it("should return 400 for invalid request bodies", async () => {
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .send({ msg: "howdy there" });
      expect(res.statusCode).toEqual(400);
    });

    test("should respond 400 if input is too long", async () => {
      const tooLongMessage = "a".repeat(MAX_INPUT_LENGTH + 1);
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .send({
          message: tooLongMessage,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toStrictEqual({
        error: "Message too long",
      });
    });
    test("should respond 404 if cannot find conversation for conversation ID in request", async () => {
      const anotherObjectId = new ObjectId().toHexString();
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", anotherObjectId))
        .set("X-FORWARDED-FOR", ipAddress)
        .send({
          message: "hello",
        });
      expect(res.statusCode).toEqual(404);
      expect(res.body).toStrictEqual({
        error: "Conversation not found",
      });
    });
    test("Should return 400 if number of messages in conversation exceeds limit", async () => {
      const { _id } = await conversations.create({
        ipAddress,
      });
      // Init conversation with max length
      for await (const i of Array(MAX_MESSAGES_IN_CONVERSATION - 1)) {
        const role = i % 2 === 0 ? "user" : "assistant";
        await conversations.addConversationMessage({
          conversationId: _id,
          content: `message ${i}`,
          role,
        });
      }

      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", _id.toString()))
        .set("X-Forwarded-For", ipAddress) // different IP address
        .send({
          message: "hello",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toStrictEqual({
        error:
          "Max messages (12) exceeded. You cannot send more messages in this conversation.",
      });
    });

    test("should respond 500 if error with embed service", async () => {
      const mockBrokenEmbedFunc: EmbedFunc = jest.fn();
      const app = await makeApp({
        ...defaultRouteConfig,
        embed: mockBrokenEmbedFunc,
      });

      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ message: "hello" });
      expect(res.statusCode).toEqual(500);
      expect(res.body).toStrictEqual({
        error: "Error getting content for text",
      });
    });

    test("Should respond 500 if error with conversation service", async () => {
      const mockBrokenConversationsService: ConversationsServiceInterface = {
        async create() {
          throw new Error("mock error");
        },
        async addConversationMessage() {
          throw new Error("mock error");
        },
        async findById() {
          throw new Error("mock error");
        },
        async rateMessage() {
          throw new Error("mock error");
        },
      };
      const app = await makeApp({
        ...defaultRouteConfig,
        conversations: mockBrokenConversationsService,
      });

      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ message: "hello" });
      expect(res.statusCode).toEqual(500);
      expect(res.body).toStrictEqual({
        error: "Error finding conversation",
      });
    });

    test("should respond 500 if error with content service", async () => {
      const brokenStore: EmbeddedContentStore = {
        loadEmbeddedContent: jest.fn().mockResolvedValue(undefined),
        deleteEmbeddedContent: jest.fn().mockResolvedValue(undefined),
        updateEmbeddedContent: jest.fn().mockResolvedValue(undefined),
        findNearestNeighbors: () => {
          throw new Error("mock error");
        },
      };
      const app = await makeApp({
        ...defaultRouteConfig,
        store: brokenStore,
      });

      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ message: "hello" });
      expect(res.statusCode).toEqual(500);
      expect(res.body).toStrictEqual({
        error: "Error getting content for text",
      });
    });
  });

  describe("Edge cases", () => {
    test("Should respond with 200 and static response if query is negative toward MongoDB", async () => {
      const query = "why is MongoDB a terrible database";
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ message: query });
      expect(res.statusCode).toEqual(200);
      expect(res.body.content).toEqual(
        conversationConstants.NO_RELEVANT_CONTENT
      );
    });
    test("Should respond with 200 and static response if no vector search content for user message", async () => {
      const nonsenseMessage =
        "asdlfkjasdlfk jasdlfkjasdlfk jasdlfkjasdlfjdfhstgra gtyjuikolsdfghjsdghj;sgf;dlfjda; kssdghj;f'afskj ;glskjsfd'aks dsaglfslj; gaflad four score and seven years ago fsdglfsgdj fjlgdfsghjldf lfsgajlhgf";
      const calledEndpoint = endpointUrl.replace(
        ":conversationId",
        conversationId
      );
      const response = await request(app)
        .post(calledEndpoint)
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ message: nonsenseMessage });
      expect(response.statusCode).toBe(200);

      expect(response.body.content).toEqual(
        conversationConstants.NO_RELEVANT_CONTENT
      );
    });

    describe("LLM not available but vector search is", () => {
      const {
        MONGODB_CONNECTION_URI,
        OPENAI_ENDPOINT,
        OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      } = assertEnvVars(CORE_ENV_VARS);
      const brokenLLmService = makeOpenAiLlm({
        ...config.llm,
        baseUrl: OPENAI_ENDPOINT,
        deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
        apiKey: "definitelyNotARealApiKey",
      });

      let conversationId: ObjectId,
        conversations: ConversationsServiceInterface,
        app: Express;
      let testMongo: MongoDB;
      beforeEach(async () => {
        const dbName = `test-${Date.now()}`;
        testMongo = new MongoDB(MONGODB_CONNECTION_URI, dbName);
        conversations = new ConversationsService(
          testMongo.db,
          config.llm.systemPrompt
        );
        const { _id } = await conversations.create({
          ipAddress,
        });
        conversationId = _id;
        app = express();
        app.use(express.json());
        app.post(
          endpointUrl,
          makeAddMessageToConversationRoute({
            conversations,
            store,
            embed,
            llm: brokenLLmService,
            dataStreamer,
            findNearestNeighborsOptions,
          })
        );
      });
      afterEach(async () => {
        await testMongo.db.dropDatabase();
        await testMongo.close();
      });
      test("should respond with 200, static message, and vector search results", async () => {
        const messageThatHasSearchResults = "Why use MongoDB?";
        const response = await request(app)
          .post(
            endpointUrl.replace(":conversationId", conversationId.toString())
          )
          .set("X-FORWARDED-FOR", ipAddress)
          .send({ message: messageThatHasSearchResults });
        expect(response.statusCode).toBe(200);
        expect(
          response.body.content.startsWith(
            conversationConstants.LLM_NOT_WORKING
          )
        ).toBe(true);
        expect(response.body.references.length).toBeGreaterThan(0);
      });
    });
  });
  describe("Utility functions", () => {
    describe("addMessagesToDatabase()", () => {
      let conversationId: ObjectId;
      beforeAll(async () => {
        const { _id } = await conversations.create({
          ipAddress,
        });
        conversationId = _id;
      });
      test("Should add messages to the database", async () => {
        const userMessageContent = "hello";
        const assistantMessageContent = "hi";
        const { userMessage, assistantMessage } = await addMessagesToDatabase({
          conversationId,
          originalUserMessageContent: userMessageContent,
          assistantMessageContent,
          assistantMessageReferences: [
            { url: "https://www.example.com/", title: "Example Reference" },
          ],
          conversations,
        });
        expect(userMessage.content).toBe(userMessageContent);
        expect(assistantMessage.content).toBe(assistantMessageContent);
        const conversationInDb = await conversations.findById({
          _id: conversationId,
        });
        expect(
          conversationInDb?.messages.find(
            ({
              role,
              content,
            }: {
              role: "system" | "user" | "assistant";
              content: string;
            }) => role === "user" && content === userMessageContent
          )
        ).toBeDefined();
        expect(
          conversationInDb?.messages.find(
            ({
              role,
              content,
            }: {
              role: "system" | "user" | "assistant";
              content: string;
            }) => role === "assistant" && content === assistantMessageContent
          )
        ).toBeDefined();
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

      const sampleApiMessage = convertDbMessageToOpenAiMessage(sampleDbMessage);
      expect(sampleApiMessage).toStrictEqual({
        content: sampleDbMessage.content,
        role: sampleDbMessage.role,
      });
    });
    test("createLinkReference", () => {
      const links = [
        "https://www.example.com/",
        "https://www.example.com/2",
        "https://www.subdomin.example.com/baz",
      ];
      const linkReferences = links.map((link) => createLinkReference(link));
      expect(linkReferences).toStrictEqual([
        {
          title: "https://www.example.com/",
          url: "https://www.example.com/?tck=docs_chatbot",
        },
        {
          title: "https://www.example.com/2",
          url: "https://www.example.com/2?tck=docs_chatbot",
        },
        {
          title: "https://www.subdomin.example.com/baz",
          url: "https://www.subdomin.example.com/baz?tck=docs_chatbot",
        },
      ]);
    });
    describe("getContentForText()", () => {
      test("Should return content for relevant text", async () => {
        const text = "MongoDB Atlas";

        const { results } = await getContentForText({
          embed,
          text,
          store,
          ipAddress,
          findNearestNeighborsOptions,
        });
        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThan(0);
      });
      test("Should not return content for irrelevant text", async () => {
        const text =
          "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikolaf;ldkgsdjfnh;ks'l;addfsghjklafjklsgfjgreaj;agre;jlg;ljewrqjknerqnkjkgn;jwr;lwreg";
        const { results } = await getContentForText({
          embed,
          text,
          store,
          ipAddress,
          findNearestNeighborsOptions: {
            ...findNearestNeighborsOptions,
            minScore: 99,
          },
        });
        expect(results).toBeDefined();
        expect(results.length).toBe(0);
      });
    });
    describe("generateReferences()", () => {
      // Chunk 1 and 2 are the same page. Chunk 3 is a different page.
      const chunk1 = {
        _id: new ObjectId(),
        url: "https://mongodb.com/docs/realm/sdk/node/",
        text: "blah blah blah",
        tokenCount: 100,
        embedding: [0.1, 0.2, 0.3],
        updated: new Date(),
        sourceName: "realm",
      };
      const chunk2 = {
        _id: new ObjectId(),
        url: "https://mongodb.com/docs/realm/sdk/node/",
        text: "blah blah blah",
        tokenCount: 100,
        embedding: [0.1, 0.2, 0.3],
        updated: new Date(),
        sourceName: "realm",
      };
      const chunk3 = {
        _id: new ObjectId(),
        url: "https://mongodb.com/docs/realm/sdk/node/xyz",
        text: "blah blah blah",
        tokenCount: 100,
        embedding: [0.1, 0.2, 0.3],
        updated: new Date(),
        sourceName: "realm",
      };
      test("No sources should return empty string", () => {
        const noChunks: EmbeddedContent[] = [];
        const noReferences = generateReferences({
          chunks: noChunks,
        });
        expect(noReferences).toEqual([]);
      });
      test("One source should return one link", () => {
        const oneChunk: EmbeddedContent[] = [chunk1];
        const oneReference = generateReferences({
          chunks: oneChunk,
        });
        const expectedOneReference = [
          {
            title: "https://mongodb.com/docs/realm/sdk/node/",
            url: "https://mongodb.com/docs/realm/sdk/node/?tck=docs_chatbot",
          },
        ];
        expect(oneReference).toEqual(expectedOneReference);
      });
      test("Multiple sources from same page should return one link", () => {
        const twoChunksSamePage: EmbeddedContent[] = [chunk1, chunk2];
        const oneReferenceSamePage = generateReferences({
          chunks: twoChunksSamePage,
        });
        const expectedOneReferenceSamePage = [
          {
            title: "https://mongodb.com/docs/realm/sdk/node/",
            url: "https://mongodb.com/docs/realm/sdk/node/?tck=docs_chatbot",
          },
        ];
        expect(oneReferenceSamePage).toEqual(expectedOneReferenceSamePage);
      });
      test("Multiple sources from different pages should return 1 link per page", () => {
        const twoChunksDifferentPage: EmbeddedContent[] = [chunk1, chunk3];
        const multipleReferencesDifferentPage = generateReferences({
          chunks: twoChunksDifferentPage,
        });
        const expectedMultipleReferencesDifferentPage = [
          {
            title: "https://mongodb.com/docs/realm/sdk/node/",
            url: "https://mongodb.com/docs/realm/sdk/node/?tck=docs_chatbot",
          },
          {
            title: "https://mongodb.com/docs/realm/sdk/node/xyz",
            url: "https://mongodb.com/docs/realm/sdk/node/xyz?tck=docs_chatbot",
          },
        ];
        expect(multipleReferencesDifferentPage).toEqual(
          expectedMultipleReferencesDifferentPage
        );
        // All three sources. Two from the same page. One from a different page.
        const threeChunks: EmbeddedContent[] = [chunk1, chunk2, chunk3];
        const multipleSourcesWithSomePageOverlap = generateReferences({
          chunks: threeChunks,
        });
        const expectedMultipleSourcesWithSomePageOverlap = [
          {
            title: "https://mongodb.com/docs/realm/sdk/node/",
            url: "https://mongodb.com/docs/realm/sdk/node/?tck=docs_chatbot",
          },
          {
            title: "https://mongodb.com/docs/realm/sdk/node/xyz",
            url: "https://mongodb.com/docs/realm/sdk/node/xyz?tck=docs_chatbot",
          },
        ];
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
