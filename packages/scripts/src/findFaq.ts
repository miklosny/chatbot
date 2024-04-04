import { strict as assert } from "assert";
import { Db, ObjectId, Collection, WithId } from "mongodb";

import {
  Conversation,
  SomeMessage,
  AssistantMessage,
  FunctionMessage,
  UserMessage,
  VectorStore,
  FindNearestNeighborsOptions,
  WithScore,
} from "mongodb-chatbot-server";
import { clusterize, DbscanOptions } from "./clusterize";
import { findCentroid } from "./findCentroid";

export type ResponseMessage = AssistantMessage | FunctionMessage;

export type QuestionAndResponses = {
  embedding: number[];
  question: UserMessage;
  responses: ResponseMessage[];
};

export type FaqEntry = {
  /**
    An arbitrarily-selected representative question from the questions array.
   */
  question: string;

  /**
    The centroid (mean) of all of the question embeddings in the cluster.
   */
  embedding: number[];

  /**
    The original question embeddings.
   */
  embeddings: number[][];

  /**
    The original question user messages.
   */
  questions: UserMessage[];

  /**
    The original response(s) to the user message.
   */
  responses: ResponseMessage[][];

  /**
    The relative frequency of this question, which is determined by cluster size
    (a cluster with more objects in it is a more frequently asked question).
   */
  faqScore: number;

  /**
    An id unique to this category of questions.
   */
  faqId?: string;
};

export const findFaq = async ({
  db,
  clusterizeOptions,
}: {
  db: Db;
  clusterizeOptions?: Partial<DbscanOptions>;
}): Promise<FaqEntry[]> => {
  const conversationsCollection = db.collection<Conversation>("conversations");
  const originalMessages = conversationsCollection.aggregate<
    SomeMessage & { indexInConvo: number; convoId: ObjectId }
  >([
    {
      $match: {
        // Include only conversations that actually had user input
        "messages.role": "user",
      },
    },
    {
      // With replaceRoot below, pass each message from conversation to next
      // stage in pipeline
      $unwind: {
        path: "$messages",
        includeArrayIndex: "indexInConvo",
      },
    },
    {
      $addFields: {
        "messages.indexInConvo": "$indexInConvo",
        "messages.convoId": "$_id",
      },
    },
    {
      $replaceRoot: { newRoot: "$messages" },
    },
    { $sort: { convoId: 1, createdAt: 1 } },
  ]);

  // Combine user question and responses into individual question & response
  // objects. In the original conversation object, every 'user' message is
  // followed by one or more non-'user' question, which is the response.
  let currentQuestion: Partial<QuestionAndResponses> | undefined;
  const questions: QuestionAndResponses[] = [];
  const addQuestionToList = (
    partialQuestion: Partial<QuestionAndResponses> | undefined
  ) => {
    if (partialQuestion === undefined) {
      return;
    }
    const { embedding, question, responses } = partialQuestion;
    assert(
      embedding !== undefined &&
        question !== undefined &&
        responses !== undefined
    );
    questions.push({ embedding, question, responses });
  };
  for await (const message of originalMessages) {
    switch (message.role) {
      case "user":
        {
          addQuestionToList(currentQuestion);
          currentQuestion = undefined;

          const { embedding } = message;
          if (embedding === undefined) {
            // Earlier versions did not store user question embedding
            continue;
          }

          currentQuestion = {
            embedding,
            question: message,
            responses: [],
          };
        }
        break;
      case "assistant":
      case "function":
        {
          currentQuestion?.responses?.push(message);
        }
        break;
      default:
        continue;
    }
  }
  addQuestionToList(currentQuestion);
  currentQuestion = undefined;

  const { clusters } = clusterize(
    questions,
    (q) => {
      assert(q.embedding);
      return q.embedding;
    },
    clusterizeOptions
  );

  const faqEntries = clusters
    .map((cluster): FaqEntry => {
      const embeddings = cluster.map(({ embedding }) => embedding);
      return {
        embedding: findCentroid(embeddings),
        embeddings,
        question: cluster[0].question.content,
        questions: cluster.map(({ question }) => question),
        responses: cluster.map(({ responses }) => responses),
        faqScore: cluster.length / questions.length,
      };
    })
    .sort((a, b) => b.faqScore - a.faqScore);

  return faqEntries;
};

/**
  Make a wrapper around the given collection that conforms to the VectorStore
  interface.

  Does not manage the collection - callers are still responsible for closing the
  client.
 */
export const makeFaqVectorStoreCollectionWrapper = (
  collection: Collection<WithId<FaqEntry & { created: Date; epsilon: number }>>
): VectorStore<WithId<FaqEntry>> => {
  return {
    findNearestNeighbors(vector, options) {
      const {
        indexName,
        path,
        k,
        minScore,
        filter,
        numCandidates,
      }: Partial<FindNearestNeighborsOptions> = {
        // Default options
        indexName: "vector_index",
        path: "embedding",
        k: 10,
        minScore: 0.95,
        // User options override
        ...(options ?? {}),
      };
      return collection
        .aggregate<WithScore<WithId<FaqEntry>>>([
          {
            $vectorSearch: {
              index: indexName,
              queryVector: vector,
              path,
              limit: k,
              numCandidates: numCandidates ?? k * 15,
              filter,
            },
          },
          {
            $addFields: {
              score: {
                $meta: "vectorSearchScore",
              },
            },
          },
          {
            $match: {
              score: { $gte: minScore },
            },
          },
        ])
        .toArray();
    },
  };
};

/**
  For each given question, finds if any similar messages already have a faqId.
  If so, adopts the faqId. Otherwise, invents a new faqId for this category of
  question.
 */
export const assignFaqIds = async ({
  faqEntries,
  faqStore,
}: {
  faqEntries: FaqEntry[];
  faqStore: VectorStore<WithId<FaqEntry>>;
}): Promise<(FaqEntry & { faqId: string })[]> => {
  return await Promise.all(
    faqEntries.map(async (q) => {
      // See if there already is an ID for this FAQ.
      const previousFaqs = await faqStore.findNearestNeighbors(q.embedding);
      const previousFaqsWithFaqIds = previousFaqs.filter(
        (q) => q.faqId !== undefined
      );
      previousFaqsWithFaqIds.sort((a, b) => b.score - a.score);

      // Use the pre-existing faqId or generate a new one for this category
      const faqId =
        previousFaqsWithFaqIds[0]?.faqId ?? ObjectId.generate().toString("hex");
      console.log(
        `${
          previousFaqsWithFaqIds[0]?.faqId === undefined
            ? "Generated new"
            : "Reused existing"
        } faqId ${faqId} for question category "${q.question}"`
      );

      return { ...q, faqId };
    })
  );
};
