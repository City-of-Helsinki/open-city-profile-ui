import fetchMock from 'jest-fetch-mock';
import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action, getOption } from '../../../common/actionQueue/actionQueue';
import {
  tunnistamoAuthCodeParserAction,
  keycloakAuthCodeParserAction,
} from '../authCodeParser';
import { getMockCalls } from '../../../common/test/jestMockHelper';
import { getServiceConnectionDeleteResult } from '../../../common/test/serviceConnectionDeleteMocking';
import {
  createDeleteServiceConnectionAction,
  deleteServiceConnectionType,
  getDeleteServiceConnectionResultOrError,
  isForbiddenResult,
  isSuccessResult,
} from '../deleteServiceConnection';

type ActionResults = ReturnType<typeof getDeleteServiceConnectionResultOrError>;

describe('deleteServiceConnection.ts', () => {
  const queryTracker = jest.fn();
  const keycloakAuthCode = 'keycloak-auth-code';
  const tunnistamoAuthCode = 'tunnistamo-auth-code';
  const serviceName = 'test-Service';
  const initTests = ({
    noKeycloadAuthCode,
    returnForbidden,
    returnError,
    returnNoData,
  }: {
    noKeycloadAuthCode?: boolean;
    noTunnistamoAuthCode?: boolean;
    returnForbidden?: boolean;
    returnError?: boolean;
    returnNoData?: boolean;
  } = {}) => {
    fetchMock.mockIf(/.*\/graphql\/.*$/, async (req: Request) => {
      const payload = await req.json();
      queryTracker(payload);

      const response = {
        data: returnNoData
          ? undefined
          : {
              ...getServiceConnectionDeleteResult(
                returnForbidden ? ['ERROR'] : undefined
              ),
            },
      };
      if (returnError === true) {
        return Promise.reject({
          body: JSON.stringify({
            message: 'Error',
          }),
        });
      }
      return Promise.resolve({ body: JSON.stringify(response) });
    });
    const queue = [
      tunnistamoAuthCodeParserAction,
      keycloakAuthCodeParserAction,
      createDeleteServiceConnectionAction(serviceName),
    ];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(tunnistamoAuthCodeParserAction.type, {
      result: tunnistamoAuthCode,
      complete: true,
    });

    if (!noKeycloadAuthCode) {
      runner.updateActionAndQueue(keycloakAuthCodeParserAction.type, {
        result: keycloakAuthCode,
        complete: true,
      });
    }
    return {
      runner,
      getAction: () => runner.getByType(deleteServiceConnectionType) as Action,
      getPayloadVariables: () => {
        const calls = getMockCalls(queryTracker);
        const lastCallArgs = calls[calls.length - 1];
        const payloadArg = lastCallArgs[0];
        if (!payloadArg) {
          return {};
        }
        return payloadArg.variables;
      },
    };
  };

  afterEach(() => {
    fetchMock.resetMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('The executor', () => {
    it('Runs the mutation', async () => {
      const { runner, getAction } = initTests();
      const action = getAction();
      const [, result] = await to(action.executor(action, runner));
      expect(isSuccessResult({ result } as ActionResults)).toBeTruthy();
    });
    it('Sends both auth codes in query variables when both are set', async () => {
      const { runner, getAction, getPayloadVariables } = initTests();
      const action = getAction();
      await to(action.executor(action, runner));
      expect(getPayloadVariables()).toMatchObject({
        input: {
          authorizationCode: tunnistamoAuthCode,
          authorizationCodeKeycloak: keycloakAuthCode,
          dryRun: false,
          serviceName,
        },
      });
    });
    it('Sends only tunnistamo auth code, when keycload code is not set', async () => {
      const { runner, getAction, getPayloadVariables } = initTests({
        noKeycloadAuthCode: true,
      });
      await to(getAction().executor(getAction(), runner));
      expect(getPayloadVariables()).toMatchObject({
        input: {
          authorizationCode: tunnistamoAuthCode,
          dryRun: false,
          serviceName,
        },
      });
    });
    it('When result has no "success" flag, promise is rejected', async () => {
      const { runner, getAction } = initTests({ returnForbidden: true });
      const [errorMessage] = await to(
        getAction().executor(getAction(), runner)
      );
      expect(
        isForbiddenResult(({ errorMessage } as unknown) as ActionResults)
      ).toBeTruthy();
    });
    it('Errors are handled', async () => {
      const { runner, getAction } = initTests({ returnError: true });
      const [errorMessage, result] = await to(
        getAction().executor(getAction(), runner)
      );
      expect(result).toBeUndefined();
      expect(errorMessage).toBeDefined();

      expect(
        isForbiddenResult(({ errorMessage } as unknown) as ActionResults)
      ).toBeFalsy();
      expect(isSuccessResult({ result } as ActionResults)).toBeFalsy();
    });
    it('Empty result rejects too', async () => {
      const { runner, getAction } = initTests({ returnNoData: true });
      const [errorMessage, result] = await to(
        getAction().executor(getAction(), runner)
      );
      expect(result).toBeUndefined();
      expect(errorMessage).toBeDefined();

      expect(
        isForbiddenResult(({ errorMessage } as unknown) as ActionResults)
      ).toBeFalsy();
      expect(isSuccessResult({ result } as ActionResults)).toBeFalsy();
    });
    it('Result should not be stored to sessionStorage', async () => {
      const { getAction } = initTests();
      expect(getOption(getAction(), 'noStorage')).toBeTruthy();
    });
    it('getDeleteServiceConnectionResultOrError() helper returns the result and/or errorMessage', async () => {
      const { runner } = initTests();
      runner.resume(deleteServiceConnectionType);
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      const results = getDeleteServiceConnectionResultOrError(runner);
      expect(results.result).toBeDefined();
      expect(results.errorMessage).toBeUndefined();
      expect(isSuccessResult(results)).toBeTruthy();
    });
  });
});
