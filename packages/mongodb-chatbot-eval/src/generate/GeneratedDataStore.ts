import { ObjectId } from "../core";

export interface GeneratedData {
  _id: ObjectId;
  commandRunId: ObjectId;
  type: string;
  data: unknown;
  evalData?: Record<string, unknown>;
}

export interface GeneratedDataStore {
  insertOne(generatedData: Omit<GeneratedData, "_id">): Promise<boolean>;
  findById(generatedDataId: ObjectId): Promise<GeneratedData | undefined>;
  find(filter: Record<string, unknown>): Promise<GeneratedData[] | undefined>;
}

// TODO: implement
export function makeMongoDbGeneratedDataStore(): GeneratedDataStore {
  return {
    async insertOne(generatedData) {
      return true;
    },
    async findById(generatedDataId) {
      return undefined;
    },
    async find(filter) {
      return undefined;
    },
  };
}
