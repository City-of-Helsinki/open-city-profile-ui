import fetchMock from 'jest-fetch-mock';
import { waitFor } from '@testing-library/react';

import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import {
  getFailingQueue,
  getSuccessfulQueue,
  rejectingAction,
  resolvingAction1,
  resolvingAction2,
} from '../../../common/actionQueue/test.util';
import {
  getActionResultAndErrorMessage,
  isAuthCodeActionNeeded,
  isTunnistamoAuthCodeAction,
} from '../utils';
import {
  keycloakRedirectionInitializationAction,
  tunnistamoRedirectionInitializationAction,
} from '../authCodeRedirectionInitialization';
import { Action } from '../../../common/actionQueue/actionQueue';
import { getGdprQueryScopesAction } from '../getGdprScopes';

describe('utils.ts', () => {
  const initTests = ({ fail }: { fail?: boolean } = {}) => {
    const queue = fail ? getFailingQueue() : getSuccessfulQueue();
    const runner = createActionQueueRunner(queue);
    return {
      runner,
    };
  };
  afterEach(() => {
    fetchMock.resetMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('getActionResultAndErrorMessage()', () => {
    it('returns result and error message of given action', async () => {
      const { runner } = initTests({ fail: true });
      const resolvingAction1Before = getActionResultAndErrorMessage(
        resolvingAction1.type,
        runner
      );
      expect(resolvingAction1Before.result).toBeUndefined();
      expect(resolvingAction1Before.errorMessage).toBeUndefined();
      runner.start();
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      const resolvingAction1After = getActionResultAndErrorMessage(
        resolvingAction1.type,
        runner
      );
      expect(resolvingAction1After.result).toBe(resolvingAction1.resolveValue);
      expect(resolvingAction1After.errorMessage).toBeUndefined();
      const rejectingActionAfter = getActionResultAndErrorMessage(
        rejectingAction.type,
        runner
      );
      expect(rejectingActionAfter.result).toBeUndefined();
      expect(rejectingActionAfter.errorMessage).toBe(
        (rejectingAction.rejectValue as Error).message
      );
      const notRunExecutedAction = getActionResultAndErrorMessage(
        resolvingAction2.type,
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
        isTunnistamoAuthCodeAction(resolvingAction1 as Action)
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
});
