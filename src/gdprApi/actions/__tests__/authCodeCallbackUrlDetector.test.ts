import to from 'await-to-js';

import { getGdprQueryScopesAction } from '../getGdprScopes';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import {
  tunnistamoAuthCodeCallbackUrlAction,
  keycloakAuthCodeCallbackUrlAction,
} from '../authCodeCallbackUrlDetector';
import {
  keycloakAuthCodeRedirectionAction,
  tunnistamoAuthCodeRedirectionAction,
} from '../authCodeRedirectionHandler';
import mockWindowLocation from '../../../common/test/mockWindowLocation';
import config from '../../../config';

const mockrejectExecutorWithStartPageRedirection = jest.fn();
jest.mock('../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../utils'),
  rejectExecutorWithStartPageRedirection: (...args: unknown[]) => {
    mockrejectExecutorWithStartPageRedirection(args);
    return Promise.reject(new Error('Mocked timeout'));
  },
}));
const mockGetAuthCodeRedirectionInitializationResult = jest.fn();
jest.mock('../authCodeRedirectionInitialization', () => ({
  __esModule: true,
  ...jest.requireActual('../authCodeRedirectionInitialization'),
  getAuthCodeRedirectionInitializationResult: () =>
    mockGetAuthCodeRedirectionInitializationResult(),
}));

describe('authCodeRedirectionAction.ts', () => {
  const mockedWindowControls = mockWindowLocation();

  const initTests = ({
    noKeycloakScopes,
    noTunnistamoScopes,
  }: {
    noTunnistamoScopes?: boolean;
    noKeycloakScopes?: boolean;
  } = {}) => {
    const queue = [
      getGdprQueryScopesAction,
      tunnistamoAuthCodeRedirectionAction,
      tunnistamoAuthCodeCallbackUrlAction,
      keycloakAuthCodeRedirectionAction,
      keycloakAuthCodeCallbackUrlAction,
    ];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(getGdprQueryScopesAction.type, {
      result: {
        keycloakScopes: noKeycloakScopes ? [] : ['scope'],
        tunnistamoScopes: noTunnistamoScopes ? [] : ['scope'],
      },
      complete: true,
    });

    return {
      runner,
      getTunnistamoAction: () =>
        runner.getByType(tunnistamoAuthCodeCallbackUrlAction.type) as Action,
      getKeycloadAction: () =>
        runner.getByType(keycloakAuthCodeCallbackUrlAction.type) as Action,
    };
  };

  afterAll(() => {
    mockedWindowControls.restore();
  });

  afterEach(() => {
    mockedWindowControls.reset();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('tunnistamoAuthCodeCallbackUrlAction and keycloakAuthCodeCallbackUrlAction', () => {
    it('Resolves to true, if authcode action is needed and current path is for the gdpr callback', async () => {
      mockedWindowControls.setPath(config.gdprCallbackPath);
      const { runner, getTunnistamoAction, getKeycloadAction } = initTests();
      const tunnistamoAction = getTunnistamoAction();
      const keycloadAction = getKeycloadAction();
      const [, resultForTunnistamo] = await to(
        tunnistamoAction.executor(tunnistamoAction, runner)
      );
      expect(resultForTunnistamo).toBeTruthy();

      const [, resultForKeycloak] = await to(
        keycloadAction.executor(keycloadAction, runner)
      );
      expect(resultForKeycloak).toBeTruthy();
    });
    it('Resolves to false, if authcode action is  not needed', async () => {
      mockedWindowControls.setPath(config.gdprCallbackPath);
      const { runner, getTunnistamoAction, getKeycloadAction } = initTests({
        noKeycloakScopes: true,
        noTunnistamoScopes: true,
      });
      const tunnistamoAction = getTunnistamoAction();
      const keycloadAction = getKeycloadAction();
      const [, resultForTunnistamo] = await to(
        tunnistamoAction.executor(tunnistamoAction, runner)
      );
      expect(resultForTunnistamo).toBeFalsy();
      const [, resultForKeycloak] = await to(
        keycloadAction.executor(keycloadAction, runner)
      );
      expect(resultForKeycloak).toBeFalsy();
    });
    it('Rejects after a timeout, when executed and current path is not for the gdpr callback, ', async () => {
      mockedWindowControls.setPath(config.errorPagePath);
      const { runner, getTunnistamoAction, getKeycloadAction } = initTests();
      const tunnistamoAction = getTunnistamoAction();
      const keycloadAction = getKeycloadAction();
      const [error1] = await to(
        tunnistamoAction.executor(tunnistamoAction, runner)
      );
      expect(error1).not.toBeNull();
      const [error2] = await to(
        keycloadAction.executor(keycloadAction, runner)
      );
      expect(error2).not.toBeNull();
    });
    it(`Rejects after a timeout, if url is a gdrp callback, but state in the url 
        does not match the action's assumed state`, async () => {
      const state = 'keycloak-state';
      mockedWindowControls.setPath(config.gdprCallbackPath);
      mockedWindowControls.setSearch('state=wrong');
      const { runner, getKeycloadAction } = initTests();

      const keycloadAction = getKeycloadAction();
      mockGetAuthCodeRedirectionInitializationResult.mockReturnValue({
        state,
        oidcUrl: 'keycloak',
      });
      const [error] = await to(keycloadAction.executor(keycloadAction, runner));
      expect(error).not.toBeNull();
    });
  });
});
