import * as core from '@actions/core';
import * as github from '@actions/github';
import { minimatch } from 'minimatch';

import { getPullRequestLabels, getRepositoryLabels, setPullRequestLabels } from './api';
import { getPullRequestEvent } from './input';

import type { Rule } from './type';

export type MainOptions = {
  base: string;
  head: string;
  rules: Rule[];
};

export const main = async ({
  base,
  head,
  rules,
}: MainOptions) => {
  if (!process.env['GITHUB_TOKEN']) {
    core.setFailed('Please set GITHUB_TOKEN to the environment variable');
    return;
  }
  const octokit = github.getOctokit(process.env['GITHUB_TOKEN']);

  const repositoryLabels = await getRepositoryLabels(octokit);
  const needLabels = rules.flatMap(rule => rule.labels);
  const missingLabels = needLabels.filter(label => !repositoryLabels.includes(label));
  if (0 < missingLabels.length) {
    core.setFailed(`Please add the following labels: ${missingLabels.join(', ')}`);
    return;
  }

  const matchRules = rules.filter(rule => minimatch(base, rule.base));
  if (matchRules.length <= 0) {
    core.warning(`No rule found for base branch: ${base}`);
    return;
  }

  const rule = matchRules.find(rule => minimatch(head, rule.head));
  if (!rule) {
    core.warning(`No rule found for head branch: ${head}`);
    return;
  }

  const labels = new Set(rule.labels);
  const { number: prNumber } = getPullRequestEvent();
  const pullRequestLabels = await getPullRequestLabels(octokit, prNumber);
  pullRequestLabels.forEach(label => labels.add(label));

  // eslint-disable-next-line unicorn/prefer-spread
  await setPullRequestLabels(octokit, prNumber, Array.from(labels));
};
