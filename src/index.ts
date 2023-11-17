import * as core from '@actions/core';

import { getRules } from './input';

(() => {
  try {
    const rules = getRules();
    console.log(rules);
  } catch (error) {
    if (error instanceof Error) {
      core.error(error);
      core.setFailed(error.message);
      return;
    }

    core.setFailed('Unexpected error');
  }
})();
