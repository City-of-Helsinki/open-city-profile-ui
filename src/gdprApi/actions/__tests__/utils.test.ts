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
  rejectExecutorWithStartPageRedirection,
} from '../utils';
import { keycloakRedirectionInitializationAction } from '../authCodeRedirectionInitialization';
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
  describe(`isAuthCodeActionNeeded() returns true is auth code is needed for Keycloak related action.
            Uses getGrprScopes as a source for scopes`, () => {
    const initAuthCodeTests = ({
      noKeycloakScopes,
    }: {
      noKeycloakScopes?: boolean;
    } = {}) => {
      const queue = [
        getGdprQueryScopesAction,
        keycloakRedirectionInitializationAction,
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
      };
    };
    it(`returns true when Keycloak scopes exist and action is Keycloak related`, async () => {
      const { runner } = initAuthCodeTests();
      expect(
        isAuthCodeActionNeeded(
          keycloakRedirectionInitializationAction as Action,
          runner
        )
      ).toBeTruthy();
    });
    it(`returns false when Keycloak scopes does not exist`, async () => {
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
          keycloakRedirectionInitializationAction as Action
        )
      ).toBe(`error=${keycloakRedirectionInitializationAction.type}`);
      expect(
        createFailedActionParams(
          keycloakRedirectionInitializationAction as Action,
          'errorMessage'
        )
      ).toBe(
        `error=${keycloakRedirectionInitializationAction.type}&message=errorMessage`
      );
    });
    it('if third argument is true, new params are appended to existing', async () => {
      const existingParams = 'param1=1&param2=2';
      mockedWindowControls.setSearch(existingParams);
      expect(
        createFailedActionParams(
          keycloakRedirectionInitializationAction as Action,
          'errorMessage',
          true
        )
      ).toBe(
        `${existingParams}&error=${keycloakRedirectionInitializationAction.type}&message=errorMessage`
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
          keycloakRedirectionInitializationAction as Action,
          'errorMessage'
        )
      );
      expect(JSON.parse(error?.message as string)).toMatchObject({
        isRedirectionRequest: true,
        path: `${path}?${createFailedActionParams(
          keycloakRedirectionInitializationAction as Action,
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
          keycloakRedirectionInitializationAction as Action,
          'errorMessage'
        )
      ).toThrow();
    });
  });
});
