import * as core from '@actions/core';

import type { Rule } from './type';

export const getRules = (): Rule[] => {
  const input = core.getMultilineInput('rules');

  return input.map((line) => {
    const matches = line.match(/^(.+)\s<-\s(.+?)\s((?:\[.+?])*)$/);

    if (!matches) {
      throw new Error(`Invalid rule: ${line}`);
    }

    const labels = (matches[3]!.match(/\[([^\]]+)]/g) || []).map(label => label.replaceAll(/[[\]]/g, ''));
    if (labels.length <= 0) {
      throw new Error(`Invalid rule: ${line}`);
    }

    return {
      base: matches[1]!,
      head: matches[2]!,
      labels: labels,
    };
  });
};
