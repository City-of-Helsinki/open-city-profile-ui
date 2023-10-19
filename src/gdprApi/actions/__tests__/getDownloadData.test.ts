import fetchMock from 'jest-fetch-mock';
import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import {
  getDownloadDataAction,
  getDownloadDataResult,
} from '../getDownloadData';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action, getOption } from '../../../common/actionQueue/actionQueue';
import {
  tunnistamoAuthCodeParserAction,
  keycloakAuthCodeParserAction,
} from '../authCodeParser';
import { getMockCalls } from '../../../common/test/jestMockHelper';

describe('getDownloadData.ts', () => {
  const queryTracker = jest.fn();
  const successfulResponse = { variable1: 'variable1' };
  const keycloakAuthCode = 'keycloak-auth-code';
  const tunnistamoAuthCode = 'tunnistamo-auth-code';
  const initTests = ({
    noKeycloadAuthCode,
    returnNoData,
    returnError,
  }: {
    noKeycloadAuthCode?: boolean;
    noTunnistamoAuthCode?: boolean;
    returnNoData?: boolean;
    returnError?: boolean;
  } = {}) => {
    fetchMock.mockIf(/.*\/graphql\/.*$/, async (req: Request) => {
      const payload = await req.json();
      queryTracker(payload);

      const response = {
        data: {
          downloadMyProfile: returnNoData !== true ? successfulResponse : null,
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
      getDownloadDataAction,
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
      getAction: () => runner.getByType(getDownloadDataAction.type) as Action,
      getPayloadVariables: () => {
        const calls = getMockCalls(queryTracker);
        const lastCallArgs = calls[calls.length - 1];
        const varArgs = lastCallArgs[0];
        if (!varArgs) {
          return {};
        }
        return varArgs.variables;
      },
    };
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    fetchMock.resetMocks();
  });
  describe('The executor', () => {
    it('Fetches download data', async () => {
      const { runner, getAction } = initTests();
      const [, result] = await to(getAction().executor(getAction(), runner));
      expect(result).toMatchObject(successfulResponse);
    });
    it('Sends both auth codes in query variables when both are set', async () => {
      const { runner, getAction, getPayloadVariables } = initTests();
      await to(getAction().executor(getAction(), runner));
      expect(getPayloadVariables()).toMatchObject({
        authorizationCode: tunnistamoAuthCode,
        authorizationCodeKeycloak: keycloakAuthCode,
      });
    });
    it('Sends only tunnistamo auth code, when keycload code is not set', async () => {
      const { runner, getAction, getPayloadVariables } = initTests({
        noKeycloadAuthCode: true,
      });
      await to(getAction().executor(getAction(), runner));
      expect(getPayloadVariables()).toMatchObject({
        authorizationCode: tunnistamoAuthCode,
      });
    });
    it('Empty data rejects the promise', async () => {
      const { runner, getAction } = initTests({ returnNoData: true });
      const [error] = await to(getAction().executor(getAction(), runner));
      expect(error).toBeDefined();
    });
    it('Errors are handled', async () => {
      const { runner, getAction } = initTests({ returnError: true });
      const [error] = await to(getAction().executor(getAction(), runner));
      expect(error).toBeDefined();
    });
    it('Result should not be stored to sessionStorage', async () => {
      const { getAction } = initTests();
      expect(getOption(getAction(), 'noStorage')).toBeTruthy();
    });
    it('getDownloadDataResult() helper returns the result', async () => {
      const { runner } = initTests();
      runner.resume(getDownloadDataAction.type);
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      expect(getDownloadDataResult(runner)).toMatchObject(successfulResponse);
    });
  });
});
