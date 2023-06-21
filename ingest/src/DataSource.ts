import { Page } from "./updatePages.js";

/**
  Represents a source of page data.
 */
export type DataSource = {
  /**
    The unique name among registered data sources.
   */
  name: string;

  /**
    Fetches all pages in the data source.
   */
  fetchPages(): Promise<Page[]>;
};
