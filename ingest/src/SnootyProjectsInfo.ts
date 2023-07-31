import fetch from "node-fetch";
import {
  SnootyProject,
  makeSnootyDataSource,
  Branch,
} from "./SnootyDataSource";
import { LocallySpecifiedSnootyProjectConfig } from "./projectSources";

/** Schema for API response from https://snooty-data-api.mongodb.com/prod/projects */
export type GetSnootyProjectsResponse = {
  data: SnootyProject[];
};

export type SnootyProjectsInfo = {
  getBaseUrl(args: {
    projectName: string;
    branchName: string;
  }): Promise<string>;

  getCurrentBranch(args: { projectName: string }): Promise<Branch>;
};

/**
  Creates a SnootyProjectsInfo object from the Snooty Data API GET projects
  endpoint.
 */
export const makeSnootyProjectsInfo = async ({
  snootyDataApiBaseUrl,
}: {
  snootyDataApiBaseUrl: string;
}): Promise<SnootyProjectsInfo & { _data: typeof data }> => {
  const response = await fetch(new URL("projects", snootyDataApiBaseUrl));
  const { data }: GetSnootyProjectsResponse = await response.json();

  // Fix Snooty API data
  data.forEach((project) => {
    project.branches.forEach((branch) => {
      // Fix booleans that might be string "true" instead of boolean `true`. For more
      // context, see https://jira.mongodb.org/browse/DOP-3862
      branch.active =
        (branch.active as unknown) === "true" || branch.active === true;

      // Some urls are http instead of https
      branch.fullUrl = branch.fullUrl.replace("http://", "https://");
    });
  });

  return {
    _data: data,

    async getBaseUrl({ projectName, branchName }) {
      const metadata = data.find(({ project }) => project === projectName);
      const branchMetaData = metadata?.branches.find(
        (branch) => branch.active && branch.gitBranchName === branchName
      );
      // Make sure there is an active branch at the specified branch name
      if (branchMetaData === undefined) {
        throw new Error(
          `For project '${projectName}', no active branch found for '${branchName}'.`
        );
      }
      return branchMetaData.fullUrl.replace("http://", "https://");
    },

    async getCurrentBranch({ projectName }) {
      const metadata = data.find(({ project }) => project === projectName);
      const currentBranch = metadata?.branches.find(
        ({ active, isStableBranch }) => active && isStableBranch
      );
      if (currentBranch === undefined) {
        throw new Error(
          `For project '${projectName}', no active branch found with isStableBranch == true.`
        );
      }
      return currentBranch;
    },
  };
};

/**
  Fill the details of the defined Snooty data sources with the info in the
  Snooty Data API projects endpoint.
 */
export const prepareSnootySources = async ({
  projects,
  snootyDataApiBaseUrl,
}: {
  projects: LocallySpecifiedSnootyProjectConfig[];
  snootyDataApiBaseUrl: string;
}) => {
  const snootyProjectsInfo = await makeSnootyProjectsInfo({
    snootyDataApiBaseUrl,
  });
  return await Promise.all(
    projects.map(async (project) => {
      const { name: projectName } = project;
      const currentBranch =
        project.currentBranch ??
        (
          await snootyProjectsInfo.getCurrentBranch({
            projectName,
          })
        ).gitBranchName;
      return await makeSnootyDataSource({
        name: `snooty-${project.name}`,
        project: {
          ...project,
          currentBranch,
          baseUrl:
            project.baseUrl?.replace(/\/?$/, "/") ??
            (await snootyProjectsInfo.getBaseUrl({
              projectName,
              branchName: currentBranch,
            })),
        },
        snootyDataApiBaseUrl,
      });
    })
  );
};
