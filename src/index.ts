import * as core from '@actions/core';

(() => {
  try {
    const rules = core.getMultilineInput('rules');
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
