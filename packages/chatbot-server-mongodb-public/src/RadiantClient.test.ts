import { assertEnvVars } from "mongodb-chatbot-server";
import { makeRadiantClients } from "./RadiantClient";
import "dotenv/config";
const { RADIANT_API_KEY, RADIANT_BASE_URL, AUTH_COOKIE } = assertEnvVars({
  RADIANT_API_KEY: "",
  RADIANT_BASE_URL: "",
  AUTH_COOKIE: "",
});
describe("Radiant clients", () => {
  it("should connect to Radiant API", async () => {
    const { llm } = makeRadiantClients({
      radiantApiKey: RADIANT_API_KEY,
      radiantBaseUrl: RADIANT_BASE_URL,
      cookie: AUTH_COOKIE,
    });
    const res = await llm.invoke("Hello, world!");
    console.log(res);
  });
});
