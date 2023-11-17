import * as github from '@actions/github';

import { getRepositoryLabels } from './api';

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
});
