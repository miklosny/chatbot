import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 75, // Number of virtual users
  duration: "60s", // Duration of the test
  // TODO: how to get 300 requests in a minute
};
const baseUrl = __ENV.BASE_URL;
if (baseUrl === undefined) {
  throw new Error(
    "BASE_URL is undefined. You must define BASE_URL in your environment."
  );
}
export default async function () {
  // First request to /user
  const conversationResponse = http.post(baseUrl + "/api/v1/conversations");

  // Check the status code for the first request
  check(conversationResponse, {
    "status is 200 (created conversation)": (r) => r.status === 200,
  });

  // Parse the conversationResponse JSON
  const { _id } = JSON.parse(conversationResponse.body as string);

  // create a message in the conversation
  const message = JSON.stringify({
    message: "What is MongoDB?",
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const messageResponse = http.post(
    baseUrl + "/api/v1/conversations/" + _id + "/messages",
    message,
    params
  );
  // // Check the status code for the second request
  check(messageResponse, {
    "status is 200 (responds with message)": (r) => r.status === 200,
    "contains message": (r) => JSON.parse(r.body as string).content,
  });

  const message2 = JSON.stringify({
    message: "Why use MongoDB?",
  });
  const messageResponse2 = http.post(
    baseUrl + "/api/v1/conversations/" + _id + "/messages",
    message2,
    params
  );
  // // Check the status code for the second request
  check(messageResponse2, {
    "status is 200 (responds with message)": (r) => r.status === 200,
    "contains message": (r) => JSON.parse(r.body as string).content,
  });
}
