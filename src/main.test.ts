import * as core from '@actions/core';

import { getRepositoryLabels } from './api';
import { main } from './main';

jest.mock('./api');

describe('main', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };

    jest.spyOn(core, 'warning').mockImplementation(jest.fn());
    jest.spyOn(core, 'setFailed').mockImplementation(jest.fn());
  });

  afterEach(() => {
    process.env = env;
  });

  it('Should fail - missing GITHUB_TOKEN', async () => {
    await main({
      base: 'base',
      head: 'head',
      rules: [],
    });

    expect(core.setFailed).toHaveBeenCalledWith('Please set GITHUB_TOKEN to the environment variable');
  });

  it('Should fail - missing labels', async () => {
    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue([]);

    await main({
      base: 'base',
      head: 'head',
      rules: [
        {
          base: 'base',
          head: 'head',
          labels: ['label'],
        },
      ],
    });

    expect(core.setFailed).toHaveBeenCalledWith('Please add the following labels: label');
  });
});
