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

  it('Should warn - no rule', async () => {
    const base = 'staging';
    const head = 'development';
    const rules = [{ base: 'main', head: 'development', labels: [] }];

    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue([]);

    await main({ base, head, rules });

    expect(core.warning).toHaveBeenCalledTimes(1);
    expect(core.warning).toHaveBeenCalledWith(`No rule found for base branch: ${base}`);
  });

  it('Should fail - no match', async () => {
    const base = 'main';
    const head = 'invalid';
    const rules = [{ base: 'main', head: 'development', labels: [] }];

    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue([]);

    await main({ base, head, rules });

    expect(core.warning).toHaveBeenCalledTimes(1);
    expect(core.warning).toHaveBeenCalledWith(`No rule found for head branch: ${head}`);
  });

  it('Should fail - missing GITHUB_TOKEN', async () => {
    const base = 'main';
    const head = 'development';
    const rules = [{ base: 'main', head: 'development', labels: [] }];

    await main({ base, head, rules });

    expect(core.setFailed).toHaveBeenCalledWith('Please set GITHUB_TOKEN to the environment variable');
  });

  it('Should fail - missing labels', async () => {
    const base = 'main';
    const head = 'development';
    const rules = [{ base: 'main', head: 'development', labels: ['label'] }];

    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue([]);

    await main({ base, head, rules });

    expect(core.setFailed).toHaveBeenCalledWith('Please add the following labels: label');
  });
});
