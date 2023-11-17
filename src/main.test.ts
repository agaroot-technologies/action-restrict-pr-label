import * as core from '@actions/core';

import { getPullRequestLabels, getRepositoryLabels, setPullRequestLabels } from './api';
import { getPullRequestEvent } from './input';
import { main } from './main';

jest.mock('./api');
jest.mock('./input');

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

  it('Should pass - simple rule', async () => {
    const base = 'main';
    const head = 'development';
    const rules = [{ base: 'main', head: 'development', labels: ['label'] }];

    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue(['label']);
    jest.mocked(getPullRequestEvent).mockReturnValue({ number: 1 });
    jest.mocked(getPullRequestLabels).mockResolvedValue([]);

    await main({ base, head, rules });

    expect(core.warning).not.toHaveBeenCalled();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(setPullRequestLabels).toHaveBeenCalledTimes(1);
    expect(setPullRequestLabels).toHaveBeenCalledWith(expect.any(Object), 1, ['label']);
  });

  it('Should pass - glob pattern rule', async () => {
    const base = 'main';
    const head = 'feature/1';
    const rules = [{ base: 'main', head: 'feature/*', labels: ['label'] }];

    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue(['label']);
    jest.mocked(getPullRequestEvent).mockReturnValue({ number: 1 });
    jest.mocked(getPullRequestLabels).mockResolvedValue([]);

    await main({ base, head, rules });

    expect(core.warning).not.toHaveBeenCalled();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(setPullRequestLabels).toHaveBeenCalledTimes(1);
    expect(setPullRequestLabels).toHaveBeenCalledWith(expect.any(Object), 1, ['label']);
  });

  it('Should pass - merge labels', async () => {
    const base = 'main';
    const head = 'development';
    const rules = [{ base: 'main', head: 'development', labels: ['label1'] }];

    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue(['label1', 'label2']);
    jest.mocked(getPullRequestEvent).mockReturnValue({ number: 1 });
    jest.mocked(getPullRequestLabels).mockResolvedValue(['label2']);

    await main({ base, head, rules });

    expect(core.warning).not.toHaveBeenCalled();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(setPullRequestLabels).toHaveBeenCalledTimes(1);
    expect(setPullRequestLabels).toHaveBeenCalledWith(expect.any(Object), 1, ['label1', 'label2']);
  });

  it('Should pass - duplicate labels', async () => {
    const base = 'main';
    const head = 'development';
    const rules = [{ base: 'main', head: 'development', labels: ['label1', 'label2'] }];

    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue(['label1', 'label2']);
    jest.mocked(getPullRequestEvent).mockReturnValue({ number: 1 });
    jest.mocked(getPullRequestLabels).mockResolvedValue(['label2']);

    await main({ base, head, rules });

    expect(core.warning).not.toHaveBeenCalled();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(setPullRequestLabels).toHaveBeenCalledTimes(1);
    expect(setPullRequestLabels).toHaveBeenCalledWith(expect.any(Object), 1, ['label1', 'label2']);
  });

  describe('Should pass - multiple rules', () => {
    const base = 'main';
    const rules = [
      { base: 'main', head: 'development', labels: ['label1', 'label2'] },
      { base: 'main', head: 'feature/*', labels: ['label3', 'label4'] },
    ];

    it('Should pass - development', async () => {
      const head = 'development';

      process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
      jest.mocked(getRepositoryLabels).mockResolvedValue(['label1', 'label2', 'label3', 'label4']);
      jest.mocked(getPullRequestEvent).mockReturnValue({ number: 1 });
      jest.mocked(getPullRequestLabels).mockResolvedValue(['label1', 'label3']);

      await main({ base, head, rules });

      expect(core.warning).not.toHaveBeenCalled();
      expect(core.setFailed).not.toHaveBeenCalled();
      expect(setPullRequestLabels).toHaveBeenCalledTimes(1);
      expect(setPullRequestLabels).toHaveBeenCalledWith(expect.any(Object), 1, ['label1', 'label2', 'label3']);
    });

    it('Should pass - feature/*', async () => {
      const head = 'feature/1';

      process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
      jest.mocked(getRepositoryLabels).mockResolvedValue(['label1', 'label2', 'label3', 'label4']);
      jest.mocked(getPullRequestEvent).mockReturnValue({ number: 1 });
      jest.mocked(getPullRequestLabels).mockResolvedValue(['label2', 'label4']);

      await main({ base, head, rules });

      expect(core.warning).not.toHaveBeenCalled();
      expect(core.setFailed).not.toHaveBeenCalled();
      expect(setPullRequestLabels).toHaveBeenCalledTimes(1);
      expect(setPullRequestLabels).toHaveBeenCalledWith(expect.any(Object), 1, ['label3', 'label4', 'label2']);
    });
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
    const rules = [
      { base: 'main', head: 'development', labels: ['label1', 'label2'] },
      { base: 'main', head: 'development', labels: ['label2', 'label3'] },
    ];

    process.env['GITHUB_TOKEN'] = 'GITHUB_TOKEN';
    jest.mocked(getRepositoryLabels).mockResolvedValue([]);

    await main({ base, head, rules });

    expect(core.setFailed).toHaveBeenCalledWith('Please add the following labels: label1, label2, label3');
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
});
