import { waitFor } from '@testing-library/react';
import to from 'await-to-js';

import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import {
  getFailingQueue,
  getSuccessfulQueue,
  rejectingActionSource,
  resolvingActionSource1,
  resolvingActionSource2,
} from '../../../common/actionQueue/test.util';
import {
  createFailedActionParams,
  createInternalRedirectionRequest,
  getActionResultAndErrorMessage,
  isAuthCodeActionNeeded,
  isTunnistamoAuthCodeAction,
  rejectExecutorWithStartPageRedirection,
} from '../utils';
import {
  keycloakRedirectionInitializationAction,
  tunnistamoRedirectionInitializationAction,
} from '../authCodeRedirectionInitialization';
import {
  Action,
  createQueueController,
  createQueueFromProps,
} from '../../../common/actionQueue/actionQueue';
import { getGdprQueryScopesAction } from '../getGdprScopes';
import mockWindowLocation from '../../../common/test/mockWindowLocation';
import { createRedirectorAndCatcherActionProps } from '../redirectionHandlers';

describe('utils.ts', () => {
  const initTests = ({ fail }: { fail?: boolean } = {}) => {
    const queue = fail ? getFailingQueue() : getSuccessfulQueue();
    const runner = createActionQueueRunner(queue);
    return {
      runner,
    };
  };
  const mockedWindowControls = mockWindowLocation();

  afterAll(() => {
    mockedWindowControls.restore();
  });

  afterEach(() => {
    mockedWindowControls.reset();
    fetchMock.resetMocks();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });
  describe('getActionResultAndErrorMessage()', () => {
    it('returns result and error message of given action', async () => {
      const { runner } = initTests({ fail: true });
      const resolvingAction1Before = getActionResultAndErrorMessage(
        resolvingActionSource1.type,
        runner
      );
      expect(resolvingAction1Before.result).toBeUndefined();
      expect(resolvingAction1Before.errorMessage).toBeUndefined();
      runner.start();
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      const resolvingAction1After = getActionResultAndErrorMessage(
        resolvingActionSource1.type,
        runner
      );
      expect(resolvingAction1After.result).toBe(
        resolvingActionSource1.resolveValue
      );
      expect(resolvingAction1After.errorMessage).toBeUndefined();
      const rejectingActionAfter = getActionResultAndErrorMessage(
        rejectingActionSource.type,
        runner
      );
      expect(rejectingActionAfter.result).toBeUndefined();
      expect(rejectingActionAfter.errorMessage).toBe(
        (rejectingActionSource.rejectValue as Error).message
      );
      const notRunExecutedAction = getActionResultAndErrorMessage(
        resolvingActionSource2.type,
        runner
      );
      expect(notRunExecutedAction.result).toBeUndefined();
      expect(notRunExecutedAction.errorMessage).toBeUndefined();
    });
    it('returns undefined  values when given type is not found', async () => {
      const { runner } = initTests({ fail: true });
      const result = getActionResultAndErrorMessage('foo', runner);
      expect(result.result).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
    });
  });
  describe('isTunnistamoAuthCodeAction()', () => {
    it('returns true if given action is one of tunnistamo related actions', async () => {
      expect(
        isTunnistamoAuthCodeAction(
          tunnistamoRedirectionInitializationAction as Action
        )
      ).toBeTruthy();
      expect(
        isTunnistamoAuthCodeAction(resolvingActionSource1 as Action)
      ).toBeFalsy();
    });
  });
  describe(`isAuthCodeActionNeeded() returns true is auth code is needed for Tunnistamo/Keycloak related action.
            Uses isTunnistamoAuthCodeAction() to define which scopes to check.
            Uses getGrprScopes as a source for scopes`, () => {
    const initAuthCodeTests = ({
      noKeycloakScopes,
      noTunnistamoScopes,
    }: {
      noTunnistamoScopes?: boolean;
      noKeycloakScopes?: boolean;
    } = {}) => {
      const queue = [
        getGdprQueryScopesAction,
        tunnistamoRedirectionInitializationAction,
        keycloakRedirectionInitializationAction,
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
      };
    };
    it(`returns true when Tunnistamo scopes exist and action is Tunnistamo related`, async () => {
      const { runner } = initAuthCodeTests();
      expect(
        isAuthCodeActionNeeded(
          tunnistamoRedirectionInitializationAction as Action,
          runner
        )
      ).toBeTruthy();
    });
    it(`returns false when Tunnistamo scopes does not exist and action is Tunnistamo related`, async () => {
      const { runner } = initAuthCodeTests({ noTunnistamoScopes: true });
      expect(
        isAuthCodeActionNeeded(
          tunnistamoRedirectionInitializationAction as Action,
          runner
        )
      ).toBeFalsy();
    });
    it(`returns true when Keycloak scopes exist and action is Keycloak related`, async () => {
      const { runner } = initAuthCodeTests();
      expect(
        isAuthCodeActionNeeded(
          keycloakRedirectionInitializationAction as Action,
          runner
        )
      ).toBeTruthy();
    });
    it(`returns false when Tunnistamo scopes does not exist and action is Keycloak related`, async () => {
      const { runner } = initAuthCodeTests({ noKeycloakScopes: true });
      expect(
        isAuthCodeActionNeeded(
          keycloakRedirectionInitializationAction as Action,
          runner
        )
      ).toBeFalsy();
    });
  });
  describe('createFailedActionParams()', () => {
    it('creates url params with failed action type and an optional message', async () => {
      expect(
        createFailedActionParams(
          tunnistamoRedirectionInitializationAction as Action
        )
      ).toBe(`error=${tunnistamoRedirectionInitializationAction.type}`);
      expect(
        createFailedActionParams(
          tunnistamoRedirectionInitializationAction as Action,
          'errorMessage'
        )
      ).toBe(
        `error=${tunnistamoRedirectionInitializationAction.type}&message=errorMessage`
      );
    });
    it('if third argument is true, new params are appended to existing', async () => {
      const existingParams = 'param1=1&param2=2';
      mockedWindowControls.setSearch(existingParams);
      expect(
        createFailedActionParams(
          tunnistamoRedirectionInitializationAction as Action,
          'errorMessage',
          true
        )
      ).toBe(
        `${existingParams}&error=${tunnistamoRedirectionInitializationAction.type}&message=errorMessage`
      );
    });
  });
  describe('createInternalRedirectionRequest()', () => {
    describe('createInternalRedirectionRequest()', () => {
      it('creates an object that can be used as action.result, indicating a redirection should be done', async () => {
        const path = '/redirect';
        expect(createInternalRedirectionRequest(path)).toMatchObject({
          isRedirectionRequest: true,
          path,
        });
      });
    });
  });
  describe('rejectExecutorWithStartPageRedirection()', () => {
    it(`creates a rejected promise with a redirection path to the start page path
        and an error message in the error.message`, async () => {
      const path = '/startPage';
      const queue = createQueueController(
        createQueueFromProps([
          ...createRedirectorAndCatcherActionProps(path),
          keycloakRedirectionInitializationAction,
        ])
      );
      const [error] = await to(
        rejectExecutorWithStartPageRedirection(
          queue,
          tunnistamoRedirectionInitializationAction as Action,
          'errorMessage'
        )
      );
      expect(JSON.parse(error?.message as string)).toMatchObject({
        isRedirectionRequest: true,
        path: `${path}?${createFailedActionParams(
          tunnistamoRedirectionInitializationAction as Action,
          'errorMessage'
        )}`,
      });
    });
    it(`throws if there is no startPagePath provided by any action`, async () => {
      const queue = createQueueController(
        createQueueFromProps([keycloakRedirectionInitializationAction])
      );
      expect(() =>
        rejectExecutorWithStartPageRedirection(
          queue,
          tunnistamoRedirectionInitializationAction as Action,
          'errorMessage'
        )
      ).toThrow();
    });
  });
});
