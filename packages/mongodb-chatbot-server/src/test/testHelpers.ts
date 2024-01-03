import { MongoClient } from "mongodb-rag-core";
import { AppConfig, makeApp } from "../app";
import { MONGODB_CONNECTION_URI, config, systemPrompt } from "./testConfig";
import { makeMongoDbConversationsService } from "../services/mongodbConversations";

export function makeTestAppConfig(defaultConfigOverrides?: Partial<AppConfig>) {
  const testDbName = `conversations-test-${Date.now()}`;
  const mongoClient = new MongoClient(MONGODB_CONNECTION_URI);
  const mongodb = mongoClient.db(testDbName);
  const conversations = makeMongoDbConversationsService(mongodb, systemPrompt);
  const appConfig: AppConfig = {
    ...config,
    conversationsRouterConfig: {
      ...config.conversationsRouterConfig,
      conversations,
    },
    ...(defaultConfigOverrides ?? {}),
  };
  return { appConfig, mongodb, conversations, systemPrompt, mongoClient };
}

export const TEST_ORIGIN = "http://localhost:5173";

/**
  Helper function to quickly make an app for testing purposes.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export async function makeTestApp(defaultConfigOverrides?: Partial<AppConfig>) {
  // ip address for local host
  const ipAddress = "127.0.0.1";
  const origin = TEST_ORIGIN;

  const { appConfig, systemPrompt, mongodb, mongoClient, conversations } =
    makeTestAppConfig(defaultConfigOverrides);
  const app = await makeApp(appConfig);

  return {
    ipAddress,
    origin,
    appConfig,
    app,
    conversations,
    mongoClient,
    mongodb,
    systemPrompt,
  };
}

/**
 * Create a URL to represent a client-side route on the test origin.
 * @param path - path to append to the origin base URL.
 * @returns a URL object with the origin base URL and the path appended.
 * @example
 * const url = createTestOriginUrl("/conversations");
 * expect(url.href).toEqual("http://localhost:5173/conversations")
 */
export function createTestOriginUrl(path: string) {
  return new URL(path, TEST_ORIGIN);
}

export { systemPrompt, generateUserPrompt } from "./testConfig";
