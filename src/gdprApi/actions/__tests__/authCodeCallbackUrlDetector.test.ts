import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { getGdprQueryScopesAction } from '../getGdprScopes';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import {
  keycloakAuthCodeCallbackUrlAction,
  isQueueWaitingForAuthCodeCallback,
  resumeQueueFromNextCallbackDetector,
  getNextAuthCodeCallbackDetector,
} from '../authCodeCallbackUrlDetector';
import { keycloakAuthCodeRedirectionAction } from '../authCodeRedirectionHandler';
import mockWindowLocation from '../../../common/test/mockWindowLocation';
import config from '../../../config';

const mockrejectExecutorWithStartPageRedirection = vi.fn();

vi.mock('../utils', async () => {
  const module = await vi.importActual('../utils');

  return {
    __esModule: true,
    ...module,
    rejectExecutorWithStartPageRedirection: (...args: unknown[]) => {
      mockrejectExecutorWithStartPageRedirection(args);
      return Promise.reject(new Error('Mocked timeout'));
    },
  };
});

const mockGetAuthCodeRedirectionInitializationResult = vi.fn();

vi.mock('../authCodeRedirectionInitialization', async () => {
  const module = await vi.importActual('../authCodeRedirectionInitialization');

  return {
    __esModule: true,
    ...module,
    getAuthCodeRedirectionInitializationResult: () =>
      mockGetAuthCodeRedirectionInitializationResult(),
  };
});

describe('authCodeRedirectionAction.ts', () => {
  const mockedWindowControls = mockWindowLocation();

  const initTests = ({
    noKeycloakScopes,
  }: {
    noKeycloakScopes?: boolean;
  } = {}) => {
    const queue = [
      getGdprQueryScopesAction,
      keycloakAuthCodeRedirectionAction,
      keycloakAuthCodeCallbackUrlAction,
    ];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(getGdprQueryScopesAction.type, {
      result: {
        keycloakScopes: noKeycloakScopes ? [] : ['scope'],
      },
      complete: true,
    });

    return {
      runner,
      getKeycloadAction: () =>
        runner.getByType(keycloakAuthCodeCallbackUrlAction.type) as Action,
    };
  };

  afterAll(() => {
    mockedWindowControls.restore();
  });

  afterEach(() => {
    mockedWindowControls.reset();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  describe('keycloakAuthCodeCallbackUrlAction', () => {
    it('Resolves to true, if authcode action is needed and current path is for the gdpr callback', async () => {
      mockedWindowControls.setPath(config.gdprCallbackPath);
      const { runner, getKeycloadAction } = initTests();
      const keycloadAction = getKeycloadAction();
      const [, resultForKeycloak] = await to(
        keycloadAction.executor(keycloadAction, runner)
      );
      expect(resultForKeycloak).toBeTruthy();
    });
    it('Resolves to false, if authcode action is  not needed', async () => {
      mockedWindowControls.setPath(config.gdprCallbackPath);
      const { runner, getKeycloadAction } = initTests({
        noKeycloakScopes: true,
      });
      const keycloadAction = getKeycloadAction();
      const [, resultForKeycloak] = await to(
        keycloadAction.executor(keycloadAction, runner)
      );
      expect(resultForKeycloak).toBeFalsy();
    });
    it('Rejects after a timeout, when executed and current path is not for the gdpr callback, ', async () => {
      mockedWindowControls.setPath(config.errorPagePath);
      const { runner, getKeycloadAction } = initTests();
      const keycloadAction = getKeycloadAction();
      const [error] = await to(keycloadAction.executor(keycloadAction, runner));
      expect(error).not.toBeNull();
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
  describe(`getNextAuthCodeCallbackDetector() and isQueueWaitingForAuthCodeCallback() are helpers for determining
            what should be done next - usually after a redirection to auth code provider has returned back.`, () => {
    it(`getNextAuthCodeCallbackDetector() returns action.type if next action is a detector or undefinded.
      isQueueWaitingForAuthCodeCallback() converts same value to a boolean.`, async () => {
      const { runner, getKeycloadAction } = initTests();
      expect(getNextAuthCodeCallbackDetector(runner)).toBeUndefined();
      expect(isQueueWaitingForAuthCodeCallback(runner)).toBeFalsy();

      expect(isQueueWaitingForAuthCodeCallback(runner)).toBeFalsy();
      runner.updateActionAndQueue(keycloakAuthCodeRedirectionAction.type, {
        complete: true,
      });
      expect(isQueueWaitingForAuthCodeCallback(runner)).toBeTruthy();
      expect(getNextAuthCodeCallbackDetector(runner)).toBe(
        getKeycloadAction().type
      );
      runner.updateActionAndQueue(getKeycloadAction().type, {
        complete: true,
      });
      expect(getNextAuthCodeCallbackDetector(runner)).toBeUndefined();
      expect(isQueueWaitingForAuthCodeCallback(runner)).toBeFalsy();
    });
  });
  describe(`resumeQueueFromNextCallbackDetector() is a helper to resume queue from a detector.`, () => {
    it(`it returns the resumed action.type or undefined if no action was resumed.`, async () => {
      const { runner, getKeycloadAction } = initTests();
      expect(resumeQueueFromNextCallbackDetector(runner)).toBeUndefined();
      runner.updateActionAndQueue(keycloakAuthCodeRedirectionAction.type, {
        complete: true,
      });

      expect(resumeQueueFromNextCallbackDetector(runner)).toBe(
        getKeycloadAction().type
      );
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      expect(resumeQueueFromNextCallbackDetector(runner)).toBeUndefined();
    });
  });
});
