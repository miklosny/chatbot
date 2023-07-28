import fs from "fs";
import { createInterface } from "readline";
import { Page } from "chat-core";
import fetch from "node-fetch";
import { DataSource } from "./DataSource";
import { snootyAstToMd } from "./snootyAstToMd";
import { ProjectBase } from "./ProjectBase";

// These types are what's in the snooty manifest jsonl file.
export type SnootyManifestEntry = {
  type: "page" | "timestamp" | "metadata" | "asset";
  data: unknown;
};

/**
  Represents a page entry in a Snooty manifest file.
 */
export type SnootyPageEntry = SnootyManifestEntry & {
  type: "page";
  data: SnootyPageData;
};

/**
  A node in the Snooty AST.
 */
export type SnootyNode = {
  type: string;
  children?: (SnootyNode | SnootyTextNode)[];
  [key: string]: unknown;
};

/**
  A Snooty AST node with a text value.
 */
export type SnootyTextNode = SnootyNode & {
  type: "text";
  children: never;
  value: string;
};

/**
  A page in the Snooty manifest.
 */
export type SnootyPageData = {
  page_id: string;
  ast: SnootyNode;
  tags?: string[];
};

export type SnootyProjectConfig = ProjectBase & {
  type: "snooty";
  /**
   * Git branch name for the current (search indexed) version of the site
   * @example "v4.10"
   */
  // TODO: we won't need this when it's added to the Snooty Data API (https://jira.mongodb.org/browse/DOP-3860)
  currentBranch: string;

  // TODO: we don't need the following config option yet, but we will when we
  // implement versions in the chatbot.
  // /**
  //  * Additional non-current branches to index
  //  * @example ["master", "v4.11"]
  //  */
  // additionalBranches?: string[];

  /**
    The base URL of pages within the project site.
   */
  baseUrl: string;
};

export type MakeSnootyDataSourceArgs = {
  /**
    The data source name.
   */
  name: string;

  /**
    The configuration for the Snooty project.
   */
  project: SnootyProjectConfig;

  /**
    The base URL for Snooty Data API requests.
   */
  snootyDataApiBaseUrl: string;
};

export const makeSnootyDataSource = async ({
  name: sourceName,
  project,
  snootyDataApiBaseUrl,
}: MakeSnootyDataSourceArgs): Promise<DataSource> => {
  const { baseUrl, currentBranch, name: snootyProjectName, tags } = project;
  return {
    baseUrl,
    currentBranch,
    snootyProjectName,
    name: sourceName,
    async fetchPages() {
      // TODO: The manifest can be quite large (>100MB) so this could stand to
      // be re-architected to use AsyncGenerators and update page-by-page. For
      // now we can just accept the memory cost.
      const getBranchDocumentsUrl = new URL(
        `projects/${snootyProjectName}/${currentBranch}/documents`,
        snootyDataApiBaseUrl
      );
      const { body } = await fetch(getBranchDocumentsUrl);
      if (body === null) {
        return [];
      }
      const stream = createInterface(body);
      const linePromises: Promise<void>[] = [];
      const pages: Page[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on("line", async (line) => {
          const entry = JSON.parse(line) as SnootyManifestEntry;
          switch (entry.type) {
            case "page":
              return linePromises.push(
                (async () => {
                  const page = await handlePage(
                    (entry as SnootyPageEntry).data,
                    { sourceName, baseUrl, tags: tags ?? [] }
                  );
                  pages.push(page);
                })()
              );
            case "asset":
              // Nothing to do with assets (images...) for now
              return;
            case "metadata":
              // Nothing to do with metadata document for now
              return;
            case "timestamp":
              // Nothing to do with timestamp document for now
              return;
            default:
              return reject(
                new Error(
                  `unexpected entry type from '${getBranchDocumentsUrl}': ${
                    (entry as Record<string, unknown>).type as string
                  }`
                )
              );
          }
        });
        stream.on("close", () => {
          resolve();
        });
      });
      await Promise.allSettled(linePromises);
      return pages;
    },
  } as DataSource;
};

/**
 * Branch with site
 */
export interface Branch {
  /**
   * Name of git branch
   * @example "master"
   */
  gitBranchName: string;
  /**
   * Whether or not the branch is active. Note that this is either a boolean or a string "true"
   * For more context, see https://jira.mongodb.org/browse/DOP-3862
   * @example true | "true"
   */
  active: boolean | "true";
  /**
   * Base URL of the site
   * @example "https://mongodb.com/docs/kotlin/coroutine/upcoming"
   */
  fullUrl: string;
}

export interface SnootyProject {
  /**
   * Snooty repo name
   * @example "docs-kotlin"
   */
  repoName: string;
  /**
   * Snooty project name
   * @example "kotlin"
   */
  project: string;
  /**
   * Branches of repo that correspond to a site
   */
  branches: Branch[];
}

const handlePage = async (
  page: SnootyPageData,
  {
    sourceName,
    baseUrl,
    tags = [],
  }: {
    sourceName: string;
    baseUrl: string;
    tags: string[];
  }
): Promise<Page> => {
  // Strip first three path segments - according to Snooty team, they'll always
  // be ${property}/docsworker-xlarge/${branch}
  const pagePath = page.page_id
    .split("/")
    .slice(3)
    .filter((segment, i) => {
      // Remove `index` if it's the only segment, as that would create broken links.
      // `index` in subdirectories is fine - Snooty has special case handling for
      // `/index` only.
      return i !== 0 || segment !== "index";
    })
    .join("/");

  return {
    url: new URL(pagePath, baseUrl.replace(/\/?$/, "/")).href.replace(
      /\/?$/, // Add trailing slash
      "/"
    ),
    sourceName,
    body: snootyAstToMd(page.ast, { baseUrl }),
    format: "md",
    tags,
  };
};
