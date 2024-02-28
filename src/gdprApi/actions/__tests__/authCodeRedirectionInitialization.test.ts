import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { getGdprQueryScopesAction } from '../getGdprScopes';
import { loadKeycloakConfigAction } from '../loadKeycloakConfig';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import {
  tunnistamoRedirectionInitializationAction,
  keycloakRedirectionInitializationAction,
  getAuthCodeRedirectionInitializationResult,
} from '../authCodeRedirectionInitialization';
import { AuthorizationUrlParams } from '../utils';

const mockTunnistamoEndPoint = 'tunnistamo.hel.ninja';
const mockKeycloakEndPoint = 'keycloak.hel.ninja';

vi.mock('../../../auth/authService', async () => {
  const module = await vi.importActual('../../../auth/authService');

  return {
    __esModule: true,
    ...module,
    default: {
      userManager: {
        metadataService: {
          getAuthorizationEndpoint: () =>
            Promise.resolve(mockTunnistamoEndPoint),
        },
      },
    },
  };
});

describe('authCodeRedirectionInitialization.ts', () => {
  const initTests = ({
    noKeycloakScopes,
    noTunnistamoScopes,
    noKeycloakUrl,
  }: {
    noTunnistamoScopes?: boolean;
    noKeycloakScopes?: boolean;
    noKeycloakUrl?: boolean;
  } = {}) => {
    const queue = [
      getGdprQueryScopesAction,
      loadKeycloakConfigAction,
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
    runner.updateActionAndQueue(loadKeycloakConfigAction.type, {
      result: noKeycloakUrl ? undefined : mockKeycloakEndPoint,
      complete: true,
    });
    return {
      runner,
      getTunnistamoAction: () =>
        runner.getByType(
          tunnistamoRedirectionInitializationAction.type
        ) as Action,
      getKeycloadAction: () =>
        runner.getByType(
          keycloakRedirectionInitializationAction.type
        ) as Action,
    };
  };
  const checkResult = (
    result: unknown,
    expectedOidcUri: string,
    minStateLength = 10
  ) =>
    (result as AuthorizationUrlParams).oidcUri === expectedOidcUri &&
    (result as AuthorizationUrlParams).state.length >= minStateLength;

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });
  it('Resolves oidc authorization url and state for the query for given oidc server', async () => {
    const { runner, getTunnistamoAction, getKeycloadAction } = initTests();
    const tunnistamoAction = getTunnistamoAction();
    const keycloadAction = getKeycloadAction();
    const [, resultForTunnistamo] = await to(
      tunnistamoAction.executor(tunnistamoAction, runner)
    );
    expect(
      checkResult(resultForTunnistamo, mockTunnistamoEndPoint)
    ).toBeTruthy();

    const [, resultForKeycloak] = await to(
      keycloadAction.executor(keycloadAction, runner)
    );
    expect(checkResult(resultForKeycloak, mockKeycloakEndPoint)).toBeTruthy();
  });
  it('Resolves empty oidc authorization url and state when given oidc server is not needed', async () => {
    const { runner, getTunnistamoAction, getKeycloadAction } = initTests({
      noKeycloakScopes: true,
      noTunnistamoScopes: true,
    });
    const tunnistamoAction = getTunnistamoAction();
    const keycloadAction = getKeycloadAction();
    const [, resultForTunnistamo] = await to(
      tunnistamoAction.executor(tunnistamoAction, runner)
    );
    expect(checkResult(resultForTunnistamo, '', 0)).toBeTruthy();

    const [, resultForKeycloak] = await to(
      keycloadAction.executor(keycloadAction, runner)
    );
    expect(checkResult(resultForKeycloak, '', 0)).toBeTruthy();
  });
  it('Rejects if oidcUri is empty', async () => {
    const { runner, getKeycloadAction } = initTests({});
    const keycloadAction = getKeycloadAction();
    const [error] = await to(keycloadAction.executor(keycloadAction, runner));
    expect(error).toBeDefined();
  });
  it('getAuthCodeRedirectionInitializationResult() returns props related to given action', async () => {
    const { runner, getTunnistamoAction, getKeycloadAction } = initTests();
    expect(
      getAuthCodeRedirectionInitializationResult(getTunnistamoAction(), runner)
    ).toBeUndefined();

    expect(
      getAuthCodeRedirectionInitializationResult(getKeycloadAction(), runner)
    ).toBeUndefined();

    runner.resume(getTunnistamoAction().type);
    await waitFor(() => {
      expect(runner.isFinished()).toBeTruthy();
    });

    expect(
      checkResult(
        getAuthCodeRedirectionInitializationResult(
          getTunnistamoAction(),
          runner
        ),
        mockTunnistamoEndPoint
      )
    ).toBeTruthy();

    expect(
      checkResult(
        getAuthCodeRedirectionInitializationResult(getKeycloadAction(), runner),
        mockKeycloakEndPoint
      )
    ).toBeTruthy();
  });
});
