import { Page } from "./Page";

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
    Version of the chunking algorithm used to produce this chunk.
    When version in the CLI is different from version in chunk, the chunk is updated.
   */
  chunkingVersion?: number;
}

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
};

export type WithScore<T> = T & { score: number };

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
    The minimum nearest-neighbor score threshold between 0-1.
   */
  minScore: number;

  /**
    Atlas Search filter expression.
   */
  filter: Record<string, unknown>;
};
