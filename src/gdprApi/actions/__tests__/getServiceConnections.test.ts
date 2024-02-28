import to from 'await-to-js';

import {
  createActionForGettingSpecificServiceConnection,
  getServiceConnectionsAction,
} from '../getServiceConnections';
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
    serviceName,
  }: {
    returnError?: boolean;
    returnNoData?: boolean;
    serviceName?: string;
  } = {}) => {
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
    const queue = [
      serviceName
        ? createActionForGettingSpecificServiceConnection(serviceName)
        : getServiceConnectionsAction,
    ];
    const runner = createActionQueueRunner(queue);
    return {
      runner,
      getAction: () =>
        runner.getByType(getServiceConnectionsAction.type) as Action,
    };
  };
  afterEach(() => {
    fetchMock.resetMocks();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });
  describe('The executor', () => {
    it('Fetches serviceConnections', async () => {
      const { getAction } = initTests();
      const action = getAction();
      const [, result] = await to(
        action.executor(action, {} as QueueController)
      );
      expect(result).toHaveLength(2);
    });
    it('Empty data rejects the promise', async () => {
      const { getAction } = initTests({ returnNoData: true });
      const action = getAction();
      const [error] = await to(
        action.executor({} as Action, {} as QueueController)
      );
      expect(error).toBeDefined();
    });
    it('Errors are handled', async () => {
      const { getAction } = initTests({ returnError: true });
      const action = getAction();

      const [error] = await to(action.executor(action, {} as QueueController));
      expect(error).toBeDefined();
    });
    it('Result should not be stored to sessionStorage', async () => {
      const { getAction } = initTests();
      const action = getAction();
      expect(getOption(action, 'noStorage')).toBeTruthy();
    });
  });
  describe('If action.data has a service name, only that service connection is returned', () => {
    const serviceName =
      serviceConnections.myProfile?.serviceConnections?.edges[0]?.node?.service
        .name;
    it('Fetches serviceConnections', async () => {
      const { getAction } = initTests({
        serviceName,
      });
      const action = getAction();
      const [, result] = await to(
        action.executor(action, {} as QueueController)
      );
      expect(serviceName).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });
});
