import { JSDOM } from "jsdom";
import {
  HandleHtmlPageFuncOptions,
  extractHtmlH1,
  handleHtmlDocument,
} from "./handleHtmlDocument";
import "dotenv/config";
import fs from "fs";
import Path from "path";
import { Page } from "chat-core";

jest.setTimeout(600000);

const javaVersion = "4.10";
const options: HandleHtmlPageFuncOptions = {
  sourceName: "sample",
  pathToPageUrl: (pathInRepo: string) =>
    `https://example.com/${pathInRepo}`.replace(/index\.html$/, "testing.html"),
  metadata: {
    productName: "Java Reactive Streams Driver",
    version: javaVersion,
  },
  extractMetadata: () => ({
    foo: "bar",
  }),
  removeElements: (domDoc: Document) => {
    return [
      ...domDoc.querySelectorAll("head"),
      ...domDoc.querySelectorAll("script"),
      ...domDoc.querySelectorAll("noscript"),
      ...domDoc.querySelectorAll(".sidebar"),
      ...domDoc.querySelectorAll(".edit-link"),
      ...domDoc.querySelectorAll(".toc"),
      ...domDoc.querySelectorAll(".nav-items"),
      ...domDoc.querySelectorAll(".bc"),
    ];
  },
  extractTitle: (domDoc: Document) => {
    const title = domDoc.querySelector("title");
    return title?.textContent ?? undefined;
  },
};

describe("handleHtmlDocument()", () => {
  let page: Page;
  beforeAll(async () => {
    const html = fs.readFileSync(
      Path.resolve(__dirname, "./test_data/sampleJava.html"),
      {
        encoding: "utf-8",
      }
    );
    page = await handleHtmlDocument("index.html", html, options);
  });
  it("should remove arbitrary nodes from DOM", () => {
    expect(page.body).not.toContain("MongoDB University");
  });
  it("should extract metadata from DOM", () => {
    expect(page.metadata).toMatchObject({
      foo: "bar",
      version: "4.10",
      productName: "Java Reactive Streams Driver",
    });
  });
  it("should extract title from DOM", () => {
    expect(page?.title).toBe("Aggregation");
  });
  it("should construct URL from path in repo", () => {
    expect(page.url).toBe("https://example.com/testing.html");
  });
});

describe("extractHtmlH1()", () => {
  it("should extract the first H1 element", () => {
    const dom = new JSDOM(`<html><body><h1>Some Title</h1></body></html>`);
    const { document } = dom.window;
    const title = extractHtmlH1(document);
    expect(title).toBe("Some Title");
  });
});