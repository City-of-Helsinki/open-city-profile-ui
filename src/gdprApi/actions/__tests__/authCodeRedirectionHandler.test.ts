import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import { keycloakAuthCodeRedirectionAction, getAuthCodeRedirectionResult } from '../authCodeRedirectionHandler';
import { keycloakRedirectionInitializationAction } from '../authCodeRedirectionInitialization';
import { getMockCalls } from '../../../common/test/mockHelper';
import { getGdprQueryScopesAction } from '../getGdprScopes';
import { AuthorizationUrlParams } from '../utils';

const mockDelayRedirection = vi.fn();

vi.mock('../utils', async () => {
  const module = await vi.importActual('../utils');

  return {
    __esModule: true,
    ...module,
    delayRedirection: (...args: unknown[]) => mockDelayRedirection(args),
  };
});

describe('authCodeRedirectionHandler.ts', () => {
  const keycloakRedirectionProps = {
    oidcUri: 'keycloak.hel.ninja',
    state: 'keycloakState',
  };
  const initTests = ({
    noKeycloakScopes,
  }: {
    noKeycloakScopes?: boolean;
  } = {}) => {
    const queue = [
      getGdprQueryScopesAction,
      keycloakRedirectionInitializationAction,
      keycloakAuthCodeRedirectionAction,
    ];
    const runner = createActionQueueRunner(queue);

    runner.updateActionAndQueue(keycloakRedirectionInitializationAction.type, {
      result: keycloakRedirectionProps,
      complete: true,
    });

    runner.updateActionAndQueue(getGdprQueryScopesAction.type, {
      result: {
        keycloakScopes: noKeycloakScopes ? [] : ['scope'],
      },
      complete: true,
    });
    return {
      runner,
      getKeycloadAction: () => runner.getByType(keycloakAuthCodeRedirectionAction.type) as Action,
      getDelayedUrl: (): string => {
        const calls = getMockCalls(mockDelayRedirection);
        const lastCallArgs = calls[calls.length - 1];
        return lastCallArgs[0] ? lastCallArgs[0][0] : '';
      },
    };
  };

  const checkUrlHasRedirectionProps = (url: string, initializationProps: Partial<AuthorizationUrlParams>) =>
    url.includes(initializationProps.oidcUri as string) &&
    url.includes(initializationProps.state as string) &&
    url.includes('state=') &&
    url.includes('redirect_uri=');

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });
  it('Resolves to true when redirection to given oidc server has started', async () => {
    const { runner, getKeycloadAction, getDelayedUrl } = initTests();
    const keycloadAction = getKeycloadAction();
    const [, resultForKeycloak] = await to(keycloadAction.executor(keycloadAction, runner));
    expect(resultForKeycloak).toBeTruthy();
    expect(checkUrlHasRedirectionProps(getDelayedUrl(), keycloakRedirectionProps)).toBeTruthy();
  });
  it('Resolves to false when given oidc server is not needed', async () => {
    const { runner, getKeycloadAction } = initTests({
      noKeycloakScopes: true,
    });

    const keycloadAction = getKeycloadAction();
    const [, resultForKeycloak] = await to(keycloadAction.executor(keycloadAction, runner));
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
    const { runner, getKeycloadAction } = initTests();

    expect(getAuthCodeRedirectionResult(getKeycloadAction(), runner)).toBeUndefined();
    runner.resume(getKeycloadAction().type);
    await waitFor(() => {
      expect(runner.isFinished()).toBeTruthy();
    });

    expect(getAuthCodeRedirectionResult(getKeycloadAction(), runner)).toBeTruthy();
  });
});
