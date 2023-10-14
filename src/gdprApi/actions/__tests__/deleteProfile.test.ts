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
import {
  createDeleteProfileAction,
  deleteProfileType,
  getDeleteProfileResult,
} from '../deleteProfile';
import { getDeleteMyProfileMutationResult } from '../../../common/test/getDeleteMyProfileMutationResult';
import createServiceConnectionsQueryVariables from '../../../profile/helpers/createServiceConnectionsQueryVariables';
import { DeleteResultLists } from '../../../profile/helpers/parseDeleteProfileResult';

describe('deleteProfile.ts', () => {
  const queryTracker = jest.fn();
  const keycloakAuthCode = 'keycloak-auth-code';
  const tunnistamoAuthCode = 'tunnistamo-auth-code';
  const language = 'AF';
  const initTests = ({
    noKeycloadAuthCode,
    returnFailed,
    returnError,
    returnNoData,
  }: {
    noKeycloadAuthCode?: boolean;
    noTunnistamoAuthCode?: boolean;
    returnFailed?: boolean;
    returnError?: boolean;
    returnNoData?: boolean;
  } = {}) => {
    fetchMock.mockIf(/.*\/graphql\/.*$/, async (req: Request) => {
      const payload = await req.json();
      queryTracker(payload);
      const result = getDeleteMyProfileMutationResult(
        returnFailed ? ['error'] : undefined
      );
      const response = {
        data: returnNoData ? undefined : result,
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
      createDeleteProfileAction(
        createServiceConnectionsQueryVariables(language).language
      ),
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
      getAction: () => runner.getByType(deleteProfileType) as Action,
      getPayloadVariables: () => {
        const calls = getMockCalls(queryTracker);
        const lastCallArgs = calls[calls.length - 1];
        const source = lastCallArgs[0];
        if (!source) {
          return {};
        }
        return source.variables;
      },
    };
  };

  afterEach(() => {
    fetchMock.resetMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('The executor', () => {
    it('Runs the mutation and returns two arrays', async () => {
      const { runner, getAction } = initTests();
      const action = getAction();
      const [, result] = (await to(action.executor(action, runner))) as [
        unknown,
        DeleteResultLists
      ];
      expect(result.successful).toHaveLength(2);
      expect(result.failures).toHaveLength(0);
    });
    it('Sends both auth codes in query variables when both are set. Language is sent too.', async () => {
      const { runner, getAction, getPayloadVariables } = initTests();
      const action = getAction();
      await to(action.executor(action, runner));
      expect(getPayloadVariables()).toMatchObject({
        input: {
          authorizationCode: tunnistamoAuthCode,
          authorizationCodeKeycloak: keycloakAuthCode,
          dryRun: true,
        },
        language,
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
          dryRun: true,
        },
        language,
      });
    });
    it('When result has failed services, promise is not rejected', async () => {
      const { runner, getAction } = initTests({ returnFailed: true });
      const action = getAction();
      const [, result] = (await to(action.executor(action, runner))) as [
        unknown,
        DeleteResultLists
      ];
      expect(result.successful).toHaveLength(1);
      expect(result.failures).toHaveLength(1);
    });
    it('Errors are handled', async () => {
      const { runner, getAction } = initTests({ returnError: true });
      const [error, result] = await to(
        getAction().executor(getAction(), runner)
      );
      expect(result).toBeUndefined();
      expect(!!error).toBeTruthy();
    });
    it('Empty result rejects too', async () => {
      const { runner, getAction } = initTests({ returnNoData: true });
      const [error, result] = await to(
        getAction().executor(getAction(), runner)
      );
      expect(result).toBeUndefined();
      expect(!!error).toBeTruthy();
    });
    it('Result should not be stored to sessionStorage', async () => {
      const { getAction } = initTests();
      expect(getOption(getAction(), 'noStorage')).toBeTruthy();
    });
    it('getDeleteProfileResultOrError() helper returns the result and/or errorMessage', async () => {
      const { runner } = initTests();
      runner.resume(deleteProfileType);
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      const resultArray = getDeleteProfileResult(runner) as DeleteResultLists;
      expect(resultArray.successful).toHaveLength(2);
      expect(resultArray.failures).toHaveLength(0);
    });
  });
});
