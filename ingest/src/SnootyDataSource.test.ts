import nock from "nock";
import fs from "fs";
import Path from "path";
import JSONL from "jsonl-parse-stringify";
import {
  SnootyNode,
  SnootyProjectConfig,
  makeSnootyDataSource,
} from "./SnootyDataSource";
import { sampleSnootyMetadata } from "./test_data/snooty_sample_metadata";
import { snootyAstToMd } from "./snootyAstToMd";
import {
  SnootyProjectsInfo,
  makeSnootyProjectsInfo,
  prepareSnootySources,
} from "./SnootyProjectsInfo";

jest.setTimeout(15000);

describe("SnootyDataSource", () => {
  const project: SnootyProjectConfig = {
    type: "snooty",
    name: "docs",
    currentBranch: "v6.0",
    tags: ["docs", "manual"],
    baseUrl: "https://mongodb.com/docs/v6.0/",
  };
  const snootyDataApiBaseUrl = "https://snooty-data-api.mongodb.com/prod/";
  describe("makeSnootyDataSource()", () => {
    const sampleDataPath = Path.resolve(
      __dirname,
      "./test_data/snooty_sample_data.txt"
    );
    const baseMock = nock(snootyDataApiBaseUrl);
    beforeEach(() => {
      baseMock
        .get(`/projects/${project.name}/${project.currentBranch}/documents`)
        .reply(200, () => fs.createReadStream(sampleDataPath));
      baseMock.get("/projects").reply(200, sampleSnootyMetadata);
    });
    afterEach(() => {
      nock.cleanAll();
    });
    it("successfully loads pages", async () => {
      const source = await makeSnootyDataSource({
        name: `snooty-test`,
        project,
        snootyDataApiBaseUrl,
      });

      const pages = await source.fetchPages();
      expect(pages.length).toBe(12);
      const astPages = JSONL.parse<{ type: string; data: { ast: SnootyNode } }>(
        fs.readFileSync(sampleDataPath, "utf8")
      );
      const baseUrl = "https://mongodb.com/docs/v6.0";
      const pageAst = astPages.filter(
        (entry: { type: string }) => entry.type === "page"
      )[1]?.data.ast;
      expect(pageAst).toBeDefined();
      const firstPageText = snootyAstToMd(pageAst!, { baseUrl });
      expect(pages[1]).toMatchObject({
        format: "md",
        sourceName: "snooty-test",
        tags: ["docs", "manual"],
        url: "https://mongodb.com/docs/v6.0/administration/",
        body: firstPageText,
      });
    });
    it("removes 'index' from page_id", async () => {
      const source = await makeSnootyDataSource({
        name: "snooty-docs",
        project: project,
        snootyDataApiBaseUrl,
      });
      const pages = await source.fetchPages();
      expect(pages.length).toBe(12);
      expect(pages[0]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        tags: ["docs", "manual"],
        url: "https://mongodb.com/docs/v6.0/",
      });

      // This one has index at the end of a subpath, so it should not be
      // stripped because only index at the root of a project has special
      // handling in Snooty
      expect(pages[2]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        tags: ["docs", "manual"],
        url: "https://mongodb.com/docs/v6.0/administration/analyzing-mongodb-performance/index/",
      });

      // This has index in the middle of the page_id that should not be stripped
      expect(pages[3]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        tags: ["docs", "manual"],
        url: "https://mongodb.com/docs/v6.0/administration/index/backup-sharded-clusters/",
      });

      // This has index but part of a wider phrase so should not be stripped
      expect(pages[4]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        tags: ["docs", "manual"],
        url: "https://mongodb.com/docs/v6.0/administration/change-streams-production-recommendations/how-to-index/",
      });
    });
  });
  describe("SnootyProjectsInfo", () => {
    let projectsInfo: SnootyProjectsInfo | undefined;
    beforeAll(async () => {
      projectsInfo = await makeSnootyProjectsInfo({
        snootyDataApiBaseUrl,
      });
    });
    afterAll(() => {
      projectsInfo = undefined;
    });

    it("gets project base url", async () => {
      const baseUrl = await projectsInfo?.getBaseUrl({
        projectName: "docs",
        branchName: "v4.4",
      });
      expect(baseUrl).toBe("https://mongodb.com/docs/v4.4");
    });
    it("throws for invalid branch", async () => {
      const baseUrlPromise = projectsInfo?.getBaseUrl({
        projectName: "docs",
        branchName: "not-a-branch",
      });
      await expect(baseUrlPromise).rejects.toThrow();
    });
    it("throws for invalid project", async () => {
      const baseUrlPromise = projectsInfo?.getBaseUrl({
        projectName: "not-a-project",
        branchName: "v4.4",
      });
      await expect(baseUrlPromise).rejects.toThrow();
    });
  });
  describe("prepareSnootySources", () => {
    it("allows override baseUrl", async () => {
      const sources = await prepareSnootySources({
        projects: [
          {
            type: "snooty",
            name: "cloud-docs",
            currentBranch: "master",
            tags: ["atlas", "docs"],
            // No override
          },
          {
            type: "snooty",
            name: "cloud-docs",
            currentBranch: "master",
            tags: ["atlas", "docs"],
            baseUrl: "https://override.example.com", // Override
          },
        ],
        snootyDataApiBaseUrl,
      });
      expect((sources[0] as any).baseUrl).toBe(
        "https://mongodb.com/docs/atlas/"
      );
      expect((sources[1] as any).baseUrl).toBe("https://override.example.com/");
    });
  });
});
