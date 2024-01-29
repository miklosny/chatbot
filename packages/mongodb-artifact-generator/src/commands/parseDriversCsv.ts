import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { makeRunLogger, type RunLogger } from "../runlogger";
// import { parse as parseCsv } from "csv-parse";
import { parse as parseCsv } from "papaparse";
import { promises as fs } from "fs";
import path from "path";

import { action as translateCodeAction } from "./translateCode";
import { action as translateDocsPageAction } from "./translateDocsPage";
import { ObjectId } from "mongodb";

let logger: RunLogger;

type ParseDriversCsvCommandArgs = {
  runId?: string;
  csv: string;
  repoPath: string;
};

export default createCommand<ParseDriversCsvCommandArgs>({
  command: "parseDriversCsv",
  builder(args) {
    return withConfigOptions(args)
      .option("runId", {
        type: "string",
        demandOption: false,
        description: "A unique identifier for this run.",
      })
      .option("csv", {
        type: "string",
        demandOption: true,
        description: "Path to the CSV",
      })
      .option("repoPath", {
        type: "string",
        demandOption: true,
        description: "Path to the local drivers repo with source assets",
      });
  },
  async handler(args) {
    logger = makeRunLogger({ topic: "parseDriversCsv" });
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    const result = await withConfig(action, args);
    logger.logInfo(`Success`);
    await logger.flushArtifacts();
    await logger.flushLogs();
    return result;
  },
  describe: "Generate a new documentation page based on a prompt.",
});

export const action = createConfiguredAction<ParseDriversCsvCommandArgs>(
  async (_config, { csv, repoPath, runId=new ObjectId().toHexString(), }) => {
    try {
      logger.logInfo(`Setting up...`);
      const csvData = await fs.readFile(csv, "utf8");
      const parsed = parseCsv(csvData, {
        header: true,
      });

      const transformHeaderNames = (csvArray: Record<string, string>[]) => {
        return csvArray.map((csvRecord) => {
          const entries = Object.entries(csvRecord).map(([header, value]) => {
            const newHeader =
              {
                "Node Asset Name": "nodeAssetName",
                "Asset Path": "nodeAssetPath",
                "Asset Type": "assetType",
                "Generated Asset": "generatedAsset",
                "Reviewed / Tested by Docs": "reviewedByDocs",
                "Reviewed / Tested by DBX": "reviewedByDbx",
                "Result (Ready to Publish or Failed)": "result",
              }[header] ?? header;
            return [newHeader, value];
          });
          return Object.fromEntries(entries);
        });
      };

      const data = parsed.data as Record<string, string>[];
      const parsedAndNormalized = transformHeaderNames(data);

      const nodeRepoBaseUrl =
        "https://github.com/mongodb/docs-node/blob/master/";

      const relevantAssetFieldsOnly = parsedAndNormalized.map(
        ({ nodeAssetName, nodeAssetPath, assetType }) => {
          const nodeAssetPathRelativeToSourceRepo = nodeAssetPath.replace(
            nodeRepoBaseUrl,
            ""
          );
          return {
            nodeAssetName,
            nodeAssetRemotePath: nodeAssetPath,
            nodeAssetPathRelativeToSourceRepo,
            nodeAssetFullPath: path.join(
              repoPath,
              nodeAssetPathRelativeToSourceRepo
            ),
            assetType,
          };
        }
      );

      const { Code: codeExampleAssets, Page: pageAssets } = groupBy(
        relevantAssetFieldsOnly.filter((r) => r !== undefined),
        (asset) => asset.assetType
      );

      for await (const [i, codeExampleAsset] of Object.entries(
        codeExampleAssets
      )) {
        console.log(`Translating[${i}] ${codeExampleAsset.nodeAssetName}`);
        await withConfig(translateCodeAction, {
          runId,
          config: "./build/standardConfig.js",
          source: codeExampleAsset.nodeAssetFullPath,
          targetDescription:
            // "The same functionality but using the MongoDB Python Driver called PyMongo. Write idiomatic code that uses equivalent methods and functions to those in the source.",
            "The same functionality but using the MongoDB C Driver. Write idiomatic code that uses equivalent methods and functions to those in the source.",
            // "The same functionality but using the MongoDB PHP Integration for Laravel, mongodb/laravel-mongodb. Write idiomatic code that uses equivalent methods and functions to those in the source.",
          targetFileExtension: "c",
        });
      }

      console.log("done!");
    } finally {
      // await cleanupFindContent();
    }
  }
);


function groupBy<T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return array.reduce((accumulator, currentItem) => {
    const key = getKey(currentItem);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(currentItem);
    return accumulator;
  }, {} as Record<K, T[]>);
}
