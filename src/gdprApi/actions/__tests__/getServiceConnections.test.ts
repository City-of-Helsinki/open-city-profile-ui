import fetchMock from 'jest-fetch-mock';
import to from 'await-to-js';

import { getServiceConnectionsAction } from '../getServiceConnections';
import getMyProfileWithServiceConnections from '../../../common/test/getMyProfileWithServiceConnections';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import {
  Action,
  QueueController,
  getOption,
} from '../../../common/actionQueue/actionQueue';

describe('getServiceConnections.ts', () => {
  const serviceConnections = getMyProfileWithServiceConnections(true);
  const initTests = ({
    returnError,
    returnNoData,
  }: { returnError?: boolean; returnNoData?: boolean } = {}) => {
    fetchMock.mockIf(/.*\/graphql\/.*$/, async () => {
      const response = {
        data: returnNoData !== true ? serviceConnections : null,
      };
      if (returnError === true) {
        return Promise.reject({
          body: JSON.stringify({
            message: 'Error',
          }),
        });
      }
      return Promise.resolve({ body: JSON.stringify(response) });
    });
    const queue = [getServiceConnectionsAction];
    const runner = createActionQueueRunner(queue);
    return {
      runner,
      action: runner.getByType(getServiceConnectionsAction.type) as Action,
    };
  };
  afterEach(() => {
    fetchMock.resetMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('The executor', () => {
    it('Fetches serviceConnections', async () => {
      const { action } = initTests();
      const [, result] = await to(
        action.executor({} as Action, {} as QueueController)
      );
      expect(result).toHaveLength(2);
    });
    it('Empty data rejects the promise', async () => {
      const { action } = initTests({ returnNoData: true });
      const [error] = await to(
        action.executor({} as Action, {} as QueueController)
      );
      expect(error).toBeDefined();
    });
    it('Errors are handled', async () => {
      const { action } = initTests({ returnError: true });
      const [error] = await to(
        action.executor({} as Action, {} as QueueController)
      );
      expect(error).toBeDefined();
    });
    it('Result should not be stored to sessionStorage', async () => {
      const { action } = initTests();
      expect(getOption(action, 'noStorage')).toBeTruthy();
    });
  });
});
