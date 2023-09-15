import { Page, PageMetadata, logger } from "chat-core";
import TurndownService from "turndown";
import * as turndownPluginGfm from "turndown-plugin-gfm";
import { JSDOM } from "jsdom";
import { HandlePageFuncOptions } from "./GitDataSource";
import { removeMarkdownImagesAndLinks } from "./removeMarkdownImagesAndLinks";

export type HandleHtmlPageFuncOptions = HandlePageFuncOptions & {
  /** Returns an array of DOM elements to be removed from the parsed document. */
  removeElements: (domDoc: Document) => Element[];

  /** Construct the `Page.url` from page path. */
  pathToPageUrl: (path: string) => string;

  /** `Page.metadata` passed from config. Included in all documents  */
  metadata?: PageMetadata;

  /**
    Extract metadata from page DOM. Added to the `Page.metadata` field.
    If a in the result of `extractMetadata()` is the same as a key in `metadata`,
    the `extractMetadata()` key will override it.
   */
  extractMetadata?: (domDoc: Document) => Record<string, unknown>;

  /** Extract `Page.title` from page content and path. */
  extractTitle?: (domDoc: Document) => string | undefined;

  /** Transform Markdown once it's been generated */
  postProcessMarkdown?: (markdown: string) => Promise<string>;
};

export async function handleHtmlDocument(
  path: string,
  content: string,
  options: HandleHtmlPageFuncOptions
) {
  const {
    extractTitle = extractHtmlH1,
    extractMetadata,
    removeElements,
    metadata,
    pathToPageUrl,
    sourceName,
    postProcessMarkdown,
  } = options;
  const turndownService = new TurndownService({
    codeBlockStyle: "fenced",
    headingStyle: "atx",
    bulletListMarker: "-",
  });
  turndownService.use(turndownPluginGfm.gfm);

  logger.info(`Processing ${path}`);
  const dom = new JSDOM(content);
  const { document: domDocument } = dom.window;

  const title = extractTitle(domDocument);
  let extractedMetadata = {};
  if (extractMetadata) {
    extractedMetadata = extractMetadata(domDocument);
  }

  const elementsToRemove = removeElements(domDocument);
  elementsToRemove.forEach((el) => el.parentNode?.removeChild(el));

  let body = removeMarkdownImagesAndLinks(
    turndownService.turndown(domDocument.body)
  );
  body = postProcessMarkdown ? await postProcessMarkdown(body) : body;
  const page: Page = {
    sourceName,
    format: "md",
    title,
    body,
    url: pathToPageUrl(path),
    metadata: {
      ...metadata,
      ...extractedMetadata,
    },
  };
  return page;
}

export function extractHtmlH1(domDoc: Document) {
  const h1 = domDoc.querySelector("h1");
  return h1?.textContent ?? undefined;
}
