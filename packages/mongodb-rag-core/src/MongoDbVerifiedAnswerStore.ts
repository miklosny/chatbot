import { DatabaseConnection } from "./DatabaseConnection";
import { VerifiedAnswer, VerifiedAnswerStore } from "./VerifiedAnswer";
import { FindNearestNeighborsOptions, WithScore } from "./VectorStore";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "./MongoDbDatabaseConnection";

export function makeMongoDbVerifiedAnswerStore({
  connectionUri,
  databaseName,
}: MakeMongoDbDatabaseConnectionParams): VerifiedAnswerStore &
  DatabaseConnection {
  const { db, drop, close } = makeMongoDbDatabaseConnection({
    connectionUri,
    databaseName,
  });
  const collection = db.collection<VerifiedAnswer>("verified_answers");
  return {
    drop,
    close,
    async findNearestNeighbors(vector, options) {
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
        path: "question.embedding",
        k: 1,
        minScore: 0.9,
        // User options override
        ...(options ?? {}),
      };
      return collection
        .aggregate<WithScore<VerifiedAnswer>>([
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
          { $match: { score: { $gte: minScore } } },
        ])
        .toArray();
    },
  };
}
