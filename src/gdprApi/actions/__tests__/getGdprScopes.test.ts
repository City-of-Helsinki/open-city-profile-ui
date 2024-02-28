import { waitFor } from '@testing-library/react';

import {
  getFetchedScopes,
  getGdprDeleteScopesAction,
  getGdprQueryScopesAction,
  isKeycloakAuthorisationCodeNeeded,
  isTunnistamoAuthorisationCodeNeeded,
} from '../getGdprScopes';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import {
  Action,
  ActionProps,
  JSONStringifyableResult,
  QueueController,
} from '../../../common/actionQueue/actionQueue';
import { getServiceConnectionsAction } from '../getServiceConnections';
import getMyProfileWithServiceConnections from '../../../common/test/getMyProfileWithServiceConnections';
import { getServiceConnectionsServices } from '../../utils';
import { getActionResultAndErrorMessage } from '../utils';

describe('getGdprScopes.ts', () => {
  const serviceConnections = getServiceConnectionsServices(
    getMyProfileWithServiceConnections(true)
  );
  const getScopes = (
    isPureKeycloak: boolean,
    scope: 'gdprQueryScope' | 'gdprDeleteScope'
  ) =>
    serviceConnections
      .filter(service => service.isPureKeycloak === isPureKeycloak)
      .map(service => service[scope]);

  const initTests = async ({
    scopeType = 'query',
    returnError,
    returnNoData,
    noServiceConnectionsAction,
    noAutoStart,
  }: {
    scopeType?: 'query' | 'delete';
    returnError?: boolean;
    returnNoData?: boolean;
    noServiceConnectionsAction?: boolean;
    noAutoStart?: boolean;
  } = {}) => {
    const fakeServiceConnectionsAction: ActionProps = {
      ...getServiceConnectionsAction,
      executor: () =>
        returnError
          ? Promise.reject(new Error('Error'))
          : Promise.resolve(
              returnNoData
                ? []
                : ((serviceConnections as unknown) as JSONStringifyableResult)
            ),
    };
    const gdprAction =
      scopeType === 'query'
        ? getGdprQueryScopesAction
        : getGdprDeleteScopesAction;

    const queue = noServiceConnectionsAction
      ? [gdprAction]
      : [fakeServiceConnectionsAction, gdprAction];

    const runner = createActionQueueRunner(queue);
    if (!noAutoStart) {
      runner.start();
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
    }
    return {
      runner,
      action: runner.getByType(getGdprQueryScopesAction.type) as Action,
      getResultAndError: () =>
        getActionResultAndErrorMessage(gdprAction.type, runner),
    };
  };
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });
  describe('getGdprQueryScopesAction', () => {
    it(`Picks gdpr query scopes from service connections.
        Scopes are grouped as "keycloakScopes" and "tunnistamoScopes".`, async () => {
      const { getResultAndError } = await initTests();

      expect(getResultAndError()).toMatchObject({
        result: {
          keycloakScopes: getScopes(true, 'gdprQueryScope'),
          tunnistamoScopes: getScopes(false, 'gdprQueryScope'),
        },
        errorMessage: undefined,
      });
    });
    it(`Empty result returns empty arrays`, async () => {
      const { getResultAndError } = await initTests({
        returnNoData: true,
      });

      expect(getResultAndError()).toMatchObject({
        result: {
          keycloakScopes: [],
          tunnistamoScopes: [],
        },
        errorMessage: undefined,
      });
    });
    it(`If serviceConnections fails, the action is not executed`, async () => {
      const { getResultAndError } = await initTests({
        returnError: true,
      });

      expect(getResultAndError().result).toBeUndefined();
      expect(getResultAndError().errorMessage).toBeUndefined();
    });
    it(`Rejects when serviceConnections action is not found`, async () => {
      const { getResultAndError } = await initTests({
        noServiceConnectionsAction: true,
      });

      expect(getResultAndError().result).toBeUndefined();
      expect(getResultAndError().errorMessage).toBeDefined();
    });
  });
  describe('getGdprDeleteScopesAction', () => {
    it(`Picks gdpr delete scopes from service connections.
        Scopes are grouped as "keycloakScopes" and "tunnistamoScopes".`, async () => {
      const { getResultAndError } = await initTests({
        scopeType: 'delete',
      });

      expect(getResultAndError()).toMatchObject({
        result: {
          keycloakScopes: getScopes(true, 'gdprDeleteScope'),
          tunnistamoScopes: getScopes(false, 'gdprDeleteScope'),
        },
        errorMessage: undefined,
      });
    });
  });

  describe(`getFetchedScopes() helper gets scopes from the queue.
            If searches for getGdprQueryScopesAction and getGdprDeleteScopesAction.`, () => {
    it(`If getGdprQueryScopesAction action is found, query scopes are returned. `, async () => {
      const { runner } = await initTests();
      expect(getFetchedScopes(runner)).toMatchObject({
        keycloakScopes: getScopes(true, 'gdprQueryScope'),
        tunnistamoScopes: getScopes(false, 'gdprQueryScope'),
      });
    });
    it(`If getGdprDeleteScopesAction action is found, delete scopes are returned. `, async () => {
      const { runner } = await initTests({ scopeType: 'delete' });
      expect(getFetchedScopes(runner)).toMatchObject({
        keycloakScopes: getScopes(true, 'gdprDeleteScope'),
        tunnistamoScopes: getScopes(false, 'gdprDeleteScope'),
      });
    });
  });
  describe(`isKeycloakAuthorisationCodeNeeded() and isTunnistamoAuthorisationCodeNeeded()
            Checks from scopes, if authorization code is needed from either oidc servers.`, () => {
    const updateServiceConnectionsResult = (
      controller: QueueController,
      result: JSONStringifyableResult
    ) => {
      controller.updateActionAndQueue(getGdprQueryScopesAction.type, {
        complete: true,
        result,
      });
    };
    it(`If scopes for keycloak are found, isKeycloakAuthorisationCodeNeeded() returns true. `, async () => {
      const { runner } = await initTests({ noAutoStart: true });
      updateServiceConnectionsResult(runner, {
        keycloakScopes: ['scope'],
        tunnistamoScopes: [],
      });
      expect(isKeycloakAuthorisationCodeNeeded(runner)).toBeTruthy();
      expect(isTunnistamoAuthorisationCodeNeeded(runner)).toBeFalsy();
    });
    it(`If scopes for tunnistamo are found, isTunnistamoAuthorisationCodeNeeded() returns true. `, async () => {
      const { runner } = await initTests({ noAutoStart: true });
      updateServiceConnectionsResult(runner, {
        keycloakScopes: [],
        tunnistamoScopes: ['scope'],
      });
      expect(isTunnistamoAuthorisationCodeNeeded(runner)).toBeTruthy();
      expect(isKeycloakAuthorisationCodeNeeded(runner)).toBeFalsy();
    });
    it(`If scopes for for both are found, both return true. `, async () => {
      const { runner } = await initTests({ noAutoStart: true });
      updateServiceConnectionsResult(runner, {
        keycloakScopes: ['scope', 'scope', 'scope'],
        tunnistamoScopes: ['scope', 'scope', 'scope'],
      });
      expect(isTunnistamoAuthorisationCodeNeeded(runner)).toBeTruthy();
      expect(isKeycloakAuthorisationCodeNeeded(runner)).toBeTruthy();
    });
  });
});
