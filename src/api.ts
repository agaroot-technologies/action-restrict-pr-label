import * as github from '@actions/github';

export const getRepositoryLabels = async (
  octokit: ReturnType<typeof github.getOctokit>,
): Promise<string[]> => {
  const result = await octokit.rest.issues.listLabelsForRepo({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  return result.data.map((label) => label.name);
};

export const getPullRequestLabels = async (
  octokit: ReturnType<typeof github.getOctokit>,
  prNumber: number,
): Promise<string[]> => {
  const result = await octokit.rest.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  return result.data.labels.map((label) => label.name);
};

export const setPullRequestLabels = async (
  octokit: ReturnType<typeof github.getOctokit>,
  prNumber: number,
  labels: string[],
): Promise<void> => {
  await octokit.rest.issues.setLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: labels,
  });
};
