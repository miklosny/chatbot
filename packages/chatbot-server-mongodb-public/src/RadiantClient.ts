import { ChatOpenAI, OpenAI } from "@langchain/openai";

export interface MongoDbRadiantParams {
  /**
    The base URL of the Radiant API.
   */
  radiantBaseUrl: string;
  /**
    The API key for the Radiant API.
   */
  radiantApiKey: string;
  /**
    `cookie` string that contains authentication information
    to access Radiant through MongoDB corporate security.

    _Must_ contain the following cookies:

    - `auth_claim_0`
    - `auth_claim_1`
    - `auth_claim_2`
    - `auth_token`
    - `auth_user`
   */
  cookie?: string;

  /**
    Optional parameters to pass to the `OpenAI` constructor.
   */
  openAiClientParams?: ConstructorParameters<typeof OpenAI>[0];
}

/**
  Constructs a client to access MongoDB [Radiant AI](https://radiantai.com/) instance.
  Used to consume models hosted with Radiant.
  Returns LangChain instances for various model types.
 */
export function makeRadiantClient({
  radiantApiKey,
  radiantBaseUrl,
  cookie,
  openAiClientParams,
}: MongoDbRadiantParams) {
  return {
    llm: new ChatOpenAI({
      model: "gpt-4",
      ...openAiClientParams,
      configuration: {
        ...(openAiClientParams?.configuration ?? {}),
        apiKey: radiantApiKey,
        baseURL: radiantBaseUrl,
        defaultHeaders: {
          ...(openAiClientParams?.configuration?.defaultHeaders ?? {}),
          cookie,
        },
      },
    }),
  };
}
