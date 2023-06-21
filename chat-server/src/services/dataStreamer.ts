// TODO: understand what's happening here
import { Response } from "express";
import { Readable } from "stream";
import { chain } from "stream-chain";
import { Duplex, stringer } from "stream-json/jsonl/Stringer";
import { logger } from "./logger";
import { Conversation } from "./conversations";
import { Content } from "./content";

interface AnswerParams {
  res: Response;
  answer: any; // TODO: figure out what streaming type is
  conversation: Conversation;
  chunks: Content[];
}

export interface DataStreamerServiceInterface {
  answer(params: AnswerParams): Promise<string>;
}
export class DataStreamerService {
  // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
  async answer({ res, answer, conversation, chunks }: AnswerParams) {
    // TODO: do stuff with the response
    return "answer";
  }
}

export const dataStreamer = new DataStreamerService();
