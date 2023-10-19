import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import {
  tunnistamoAuthCodeRedirectionAction,
  keycloakAuthCodeRedirectionAction,
  getAuthCodeRedirectionResult,
} from '../authCodeRedirectionHandler';
import {
  tunnistamoRedirectionInitializationAction,
  keycloakRedirectionInitializationAction,
} from '../authCodeRedirectionInitialization';
import { getMockCalls } from '../../../common/test/jestMockHelper';
import { getGdprQueryScopesAction } from '../getGdprScopes';
import { AuthorizationUrlParams } from '../utils';

const mockDelayRedirection = jest.fn();
jest.mock('../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../utils'),
  delayRedirection: (...args: unknown[]) => mockDelayRedirection(args),
}));

describe('authCodeRedirectionHandler.ts', () => {
  const tunnistamoRedirectionProps = {
    oidcUri: 'tunnistamo.hel.ninja',
    state: 'tunnistamoState',
  };
  const keycloakRedirectionProps = {
    oidcUri: 'keycloak.hel.ninja',
    state: 'keycloakState',
  };
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
      tunnistamoRedirectionInitializationAction,
      keycloakRedirectionInitializationAction,
      tunnistamoAuthCodeRedirectionAction,
      keycloakAuthCodeRedirectionAction,
    ];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(
      tunnistamoRedirectionInitializationAction.type,
      {
        result: tunnistamoRedirectionProps,
        complete: true,
      }
    );
    if (!noKeycloakUrl) {
      runner.updateActionAndQueue(
        keycloakRedirectionInitializationAction.type,
        {
          result: keycloakRedirectionProps,
          complete: true,
        }
      );
    }
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
        runner.getByType(tunnistamoAuthCodeRedirectionAction.type) as Action,
      getKeycloadAction: () =>
        runner.getByType(keycloakAuthCodeRedirectionAction.type) as Action,
      getDelayedUrl: (): string => {
        const calls = getMockCalls(mockDelayRedirection);
        const lastCallArgs = calls[calls.length - 1];
        return lastCallArgs[0] ? lastCallArgs[0][0] : '';
      },
    };
  };

  const checkUrlHasRedirectionProps = (
    url: string,
    initializationProps: Partial<AuthorizationUrlParams>
  ) =>
    url.includes(initializationProps.oidcUri as string) &&
    url.includes(initializationProps.state as string) &&
    url.includes('state=') &&
    url.includes('redirect_uri=');

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  it('Resolves to true when redirection to given oidc server has started', async () => {
    const {
      runner,
      getTunnistamoAction,
      getKeycloadAction,
      getDelayedUrl,
    } = initTests();
    const tunnistamoAction = getTunnistamoAction();
    const keycloadAction = getKeycloadAction();
    const [, resultForTunnistamo] = await to(
      tunnistamoAction.executor(tunnistamoAction, runner)
    );
    expect(resultForTunnistamo).toBeTruthy();

    expect(
      checkUrlHasRedirectionProps(getDelayedUrl(), tunnistamoRedirectionProps)
    ).toBeTruthy();

    const [, resultForKeycloak] = await to(
      keycloadAction.executor(keycloadAction, runner)
    );
    expect(resultForKeycloak).toBeTruthy();
    expect(
      checkUrlHasRedirectionProps(getDelayedUrl(), keycloakRedirectionProps)
    ).toBeTruthy();
  });
  it('Resolves to false when given oidc server is not needed', async () => {
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
    expect(mockDelayRedirection).toHaveBeenCalledTimes(0);

    const [, resultForKeycloak] = await to(
      keycloadAction.executor(keycloadAction, runner)
    );
    expect(resultForKeycloak).toBeFalsy();
    expect(mockDelayRedirection).toHaveBeenCalledTimes(0);
  });
  it('Rejects if oidcUri is empty', async () => {
    const { runner, getKeycloadAction } = initTests({});
    const keycloadAction = getKeycloadAction();
    const [error] = await to(keycloadAction.executor(keycloadAction, runner));
    expect(error).toBeDefined();
  });
  it('getAuthCodeRedirectionResult() returns result of the related action', async () => {
    const { runner, getTunnistamoAction, getKeycloadAction } = initTests();
    expect(
      getAuthCodeRedirectionResult(getTunnistamoAction(), runner)
    ).toBeUndefined();

    expect(
      getAuthCodeRedirectionResult(getKeycloadAction(), runner)
    ).toBeUndefined();
    runner.resume(getTunnistamoAction().type);
    await waitFor(() => {
      expect(runner.isFinished()).toBeTruthy();
    });

    expect(
      getAuthCodeRedirectionResult(getTunnistamoAction(), runner)
    ).toBeTruthy();

    expect(
      getAuthCodeRedirectionResult(getKeycloadAction(), runner)
    ).toBeTruthy();
  });
});
