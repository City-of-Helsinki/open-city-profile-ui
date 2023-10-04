import to from 'await-to-js';
import fetchMock from 'jest-fetch-mock';

import { getGdprQueryScopesAction } from '../getGdprScopes';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action, ActionProps } from '../../../common/actionQueue/actionQueue';
import {
  getloadKeycloakConfigResult,
  loadKeycloakConfigAction,
} from '../loadKeycloakConfig';

describe('loadKeycloakConfig.ts', () => {
  const fakeResult = '/authorization_endpoint/';
  const initTests = ({
    returnError,
    returnNotFound,
    returnMalformed,
    noKeycloakScopes,
  }: {
    returnError?: boolean;
    returnNotFound?: boolean;
    returnMalformed?: boolean;
    noKeycloakScopes?: boolean;
  } = {}) => {
    fetchMock.mockIf(/.*\/\.well-known\/.*$/, async () => {
      const body = !returnMalformed
        ? JSON.stringify({ authorization_endpoint: fakeResult })
        : '{/malformed';
      if (returnError === true) {
        return Promise.reject({
          body: JSON.stringify({
            message: 'Error',
          }),
        });
      }
      if (returnNotFound === true) {
        return Promise.reject({
          ok: false,
          status: 404,
        });
      }
      return Promise.resolve({ body });
    });
    const fakeGetGdprQueryScopesAction: ActionProps = {
      ...getGdprQueryScopesAction,
    };
    const queue = [fakeGetGdprQueryScopesAction, loadKeycloakConfigAction];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(getGdprQueryScopesAction.type, {
      result: {
        keycloakScopes: noKeycloakScopes ? [] : ['scope'],
      },
      complete: true,
    });

    return {
      runner,
      action: runner.getByType(loadKeycloakConfigAction.type) as Action,
    };
  };
  afterEach(() => {
    fetchMock.resetMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  it('Fetches open-id configuration and returns authorization_endpoint', async () => {
    const { runner, action } = initTests();
    const [, result] = await to(action.executor(action, runner));
    expect(result).toBe(fakeResult);
  });
  it('Handles malformed data', async () => {
    const { runner, action } = initTests({ returnMalformed: true });
    const [error] = await to(action.executor(action, runner));
    expect(error).toBeDefined();
  });
  it('Handles errors', async () => {
    const { runner, action } = initTests({ returnError: true });
    const [error] = await to(action.executor(action, runner));
    expect(error).toBeDefined();
  });
  it('getloadKeycloakConfigResult() helper returns the endpoint', async () => {
    const { runner, action } = initTests();
    expect(getloadKeycloakConfigResult(runner)).toBe(undefined);
    runner.resume(action.type);
    await runner.getPromise();
    expect(getloadKeycloakConfigResult(runner)).toBe(fakeResult);
  });
  it('Resolves to false, when keycloak auth code is not needed.', async () => {
    const { runner, action } = initTests({ noKeycloakScopes: true });
    const [, result] = await to(action.executor(action, runner));
    expect(result).toBe(false);
  });
});
