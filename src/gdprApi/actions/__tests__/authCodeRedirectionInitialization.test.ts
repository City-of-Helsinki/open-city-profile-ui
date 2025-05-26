import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { getGdprQueryScopesAction } from '../getGdprScopes';
import { loadKeycloakConfigAction } from '../loadKeycloakConfig';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import {
  keycloakRedirectionInitializationAction,
  getAuthCodeRedirectionInitializationResult,
} from '../authCodeRedirectionInitialization';
import { AuthorizationUrlParams } from '../utils';

const mockKeycloakEndPoint = 'keycloak.hel.ninja';

describe('authCodeRedirectionInitialization.ts', () => {
  const initTests = ({
    noKeycloakScopes,
    noKeycloakUrl,
  }: {
    noKeycloakScopes?: boolean;
    noKeycloakUrl?: boolean;
  } = {}) => {
    const queue = [getGdprQueryScopesAction, loadKeycloakConfigAction, keycloakRedirectionInitializationAction];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(getGdprQueryScopesAction.type, {
      result: {
        keycloakScopes: noKeycloakScopes ? [] : ['scope'],
      },
      complete: true,
    });
    runner.updateActionAndQueue(loadKeycloakConfigAction.type, {
      result: noKeycloakUrl ? undefined : mockKeycloakEndPoint,
      complete: true,
    });
    return {
      runner,
      getKeycloadAction: () => runner.getByType(keycloakRedirectionInitializationAction.type) as Action,
    };
  };
  const checkResult = (result: unknown, expectedOidcUri: string, minStateLength = 10) =>
    (result as AuthorizationUrlParams).oidcUri === expectedOidcUri &&
    (result as AuthorizationUrlParams).state.length >= minStateLength;

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });
  it('Resolves oidc authorization url and state for the query for given oidc server', async () => {
    const { runner, getKeycloadAction } = initTests();
    const keycloadAction = getKeycloadAction();
    const [, resultForKeycloak] = await to(keycloadAction.executor(keycloadAction, runner));
    expect(checkResult(resultForKeycloak, mockKeycloakEndPoint)).toBeTruthy();
  });
  it('Resolves empty oidc authorization url and state when given oidc server is not needed', async () => {
    const { runner, getKeycloadAction } = initTests({
      noKeycloakScopes: true,
    });
    const keycloadAction = getKeycloadAction();

    const [, resultForKeycloak] = await to(keycloadAction.executor(keycloadAction, runner));
    expect(checkResult(resultForKeycloak, '', 0)).toBeTruthy();
  });
  it('Rejects if oidcUri is empty', async () => {
    const { runner, getKeycloadAction } = initTests({});
    const keycloadAction = getKeycloadAction();
    const [error] = await to(keycloadAction.executor(keycloadAction, runner));
    expect(error).toBeDefined();
  });
  it('getAuthCodeRedirectionInitializationResult() returns props related to given action', async () => {
    const { runner, getKeycloadAction } = initTests();

    expect(getAuthCodeRedirectionInitializationResult(getKeycloadAction(), runner)).toBeUndefined();

    runner.resume(getKeycloadAction().type);
    await waitFor(() => {
      expect(runner.isFinished()).toBeTruthy();
    });
    expect(
      checkResult(getAuthCodeRedirectionInitializationResult(getKeycloadAction(), runner), mockKeycloakEndPoint),
    ).toBeTruthy();
  });
});
