import * as core from '@actions/core';
import * as github from '@actions/github';
import { minimatch } from 'minimatch';

import { getRepositoryLabels } from './api';

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

  console.log({
    base,
    head,
    rules,
  });
};
