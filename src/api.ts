import * as github from '@actions/github';

export const getRepositoryLabels = async (
  octokit: ReturnType<typeof github.getOctokit>,
): Promise<string[]> => {
  const result = await octokit.rest.issues.listLabelsForRepo({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  return result.data.map(label => label.name);
};
