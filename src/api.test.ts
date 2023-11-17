import * as github from '@actions/github';

import { getPullRequestLabels, getRepositoryLabels, setPullRequestLabels } from './api';

describe('api', () => {
  describe('getRepositoryLabels', () => {
    const octokit = {
      rest: {
        issues: {
          listLabelsForRepo: jest.fn(),
        },
      },
    } as unknown as ReturnType<typeof github.getOctokit>;

    beforeEach(() => {
      jest.spyOn(github.context, 'repo', 'get').mockReturnValue({
        owner: 'owner',
        repo: 'repo',
      });

      jest.mocked(octokit.rest.issues.listLabelsForRepo).mockResolvedValue({
        data: [
          { name: 'label1' },
          { name: 'label2' },
          { name: 'label3' },
        ],
      } as unknown as ReturnType<typeof octokit.rest.issues.listLabelsForRepo>);
    });

    it('Should return label names', async () => {
      const labels = await getRepositoryLabels(octokit);

      expect(labels).toEqual(['label1', 'label2', 'label3']);
    });

    it('Should pass correct arguments', async () => {
      await getRepositoryLabels(octokit);

      expect(octokit.rest.issues.listLabelsForRepo).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
      });
    });
  });

  describe('getPullRequestLabels', () => {
    const octokit = {
      rest: {
        pulls: {
          get: jest.fn(),
        },
      },
    } as unknown as ReturnType<typeof github.getOctokit>;

    beforeEach(() => {
      jest.spyOn(github.context, 'repo', 'get').mockReturnValue({
        owner: 'owner',
        repo: 'repo',
      });

      jest.mocked(octokit.rest.pulls.get).mockResolvedValue({
        data: {
          labels: [
            { name: 'label1' },
            { name: 'label2' },
            { name: 'label3' },
          ],
        },
      } as unknown as ReturnType<typeof octokit.rest.pulls.get>);
    });

    it('Should return label names', async () => {
      const labels = await getPullRequestLabels(octokit, 1);

      expect(labels).toEqual(['label1', 'label2', 'label3']);
    });

    it('Should pass correct arguments', async () => {
      await getPullRequestLabels(octokit, 1);

      expect(octokit.rest.pulls.get).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
      });
    });
  });

  describe('setPullRequestLabels', () => {
    const octokit = {
      rest: {
        issues: {
          setLabels: jest.fn(),
        },
      },
    } as unknown as ReturnType<typeof github.getOctokit>;

    beforeEach(() => {
      jest.spyOn(github.context, 'repo', 'get').mockReturnValue({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('Should pass correct arguments', async () => {
      await setPullRequestLabels(octokit, 1, ['label1', 'label2', 'label3']);

      expect(octokit.rest.issues.setLabels).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 1,
        labels: ['label1', 'label2', 'label3'],
      });
    });
  });
});
