import { Page } from "./Page";

/**
  The embedded content of a chunk of text stored in the database.
 */
export interface EmbeddedContent {
  /**
    The URL of the page with the content.
   */
  url: string;

  /**
    The name of the data source the page was loaded from.
   */
  sourceName: string;

  /**
    The text represented by the vector embedding.
   */
  text: string;

  /**
    The number of embedding tokens in the content.
   */
  tokenCount: number;

  /**
    The vector embedding of the text.
   */
  embedding: number[];

  /**
    The date the content was last updated.
   */
  updated: Date;

  /**
    Arbitrary metadata associated with the content. If the content text has
    metadata in Front Matter format, this metadata should match that metadata.
   */
  metadata?: { tags?: string[]; [k: string]: unknown };

  /**
    The order of the chunk if this content was chunked from a larger page.
   */
  chunkIndex?: number;

  /**
    Non-cryptographic hash of the actual chunking function (and its options)
    used to produce this chunk. Used to detect whether the chunk should be
    updated because the function or options have changed.
   */
  chunkAlgoHash?: string;
}

/**
  Data store of the embedded content.
 */
export type EmbeddedContentStore = {
  /**
    Load the embedded content for the given page.
   */
  loadEmbeddedContent(args: { page: Page }): Promise<EmbeddedContent[]>;

  /**
    Delete all embedded content for the given page.
   */
  deleteEmbeddedContent(args: { page: Page }): Promise<void>;

  /**
    Replace all embedded content for the given page with the given embedded content.
   */
  updateEmbeddedContent(args: {
    page: Page;
    embeddedContent: EmbeddedContent[];
  }): Promise<void>;

  /**
    Find nearest neighbors to the given vector.
   */
  findNearestNeighbors(
    vector: number[],
    options?: Partial<FindNearestNeighborsOptions>
  ): Promise<WithScore<EmbeddedContent>[]>;

  /**
    Close connection to data store.
   */
  close?: () => Promise<void>;
};

export type WithScore<T> = T & { score: number };

/**
  Options for performing a nearest-neighbor search.
 */
export type FindNearestNeighborsOptions = {
  /**
    The name of the index to use.
   */
  indexName: string;

  /**
    The keypath to the field with the vector data to use.
   */
  path: string;

  /**
    The number of nearest neighbors to return.
   */
  k: number;

  /**
    Number of nearest neighbors to use during the search.
    Value must be less than or equal to (<=) 10000.
    You can't specify a number less than the number of documents to return (k).
   */
  numCandidates: number;

  /**
    The minimum nearest-neighbor score threshold between 0-1.
   */
  minScore: number;

  /**
    Search filter expression.
   */
  filter: Record<string, unknown>;
};
