import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { getGdprQueryScopesAction } from '../getGdprScopes';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import {
  tunnistamoAuthCodeParserAction,
  keycloakAuthCodeParserAction,
  getStoredKeycloakAuthCode,
  getStoredTunnistamoAuthCode,
} from '../authCodeParser';
import {
  tunnistamoRedirectionInitializationAction,
  keycloakRedirectionInitializationAction,
} from '../authCodeRedirectionInitialization';
import mockWindowLocation from '../../../common/test/mockWindowLocation';

describe('authCodeParser.ts', () => {
  const mockedWindowControls = mockWindowLocation();
  const correctKeycloakState = 'correct-keycloak-state';
  const wrongKeycloakState = 'wrong-keycloak-state';
  const correctTunnistamoState = 'correct-tunnistamo-state';
  const keycloakAuthCode = 'keycloak-auth-code';
  const tunnistamoAuthCode = 'tunnistamo-auth-code';
  const initTests = ({
    noKeycloakScopes,
    noTunnistamoScopes,
    noKeycloakProps,
    useWrongKeycloakState,
    setTunnistamoParserComplete,
  }: {
    noTunnistamoScopes?: boolean;
    noKeycloakScopes?: boolean;
    noKeycloakProps?: boolean;
    useWrongKeycloakState?: boolean;
    setTunnistamoParserComplete?: boolean;
  } = {}) => {
    const queue = [
      getGdprQueryScopesAction,
      tunnistamoRedirectionInitializationAction,
      keycloakRedirectionInitializationAction,
      tunnistamoAuthCodeParserAction,
      keycloakAuthCodeParserAction,
    ];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(getGdprQueryScopesAction.type, {
      result: {
        keycloakScopes: noKeycloakScopes ? [] : ['scope'],
        tunnistamoScopes: noTunnistamoScopes ? [] : ['scope'],
      },
      complete: true,
    });
    runner.updateActionAndQueue(keycloakRedirectionInitializationAction.type, {
      result: noKeycloakProps
        ? undefined
        : {
            oidcUri: 'keycloak',
            state: useWrongKeycloakState
              ? wrongKeycloakState
              : correctKeycloakState,
          },
      complete: true,
    });
    runner.updateActionAndQueue(
      tunnistamoRedirectionInitializationAction.type,
      {
        result: {
          oidcUri: 'tunnistamo',
          state: correctTunnistamoState,
        },
        complete: true,
      }
    );
    if (setTunnistamoParserComplete) {
      runner.updateActionAndQueue(tunnistamoAuthCodeParserAction.type, {
        result: tunnistamoAuthCode,
        complete: true,
      });
    }
    return {
      runner,
      getTunnistamoAction: () =>
        runner.getByType(tunnistamoAuthCodeParserAction.type) as Action,
      getKeycloadAction: () =>
        runner.getByType(keycloakAuthCodeParserAction.type) as Action,
    };
  };
  const setReturnUrl = (authCode: string, state: string) => {
    mockedWindowControls.setSearch(`code=${authCode}&state=${state}`);
  };

  afterAll(() => {
    mockedWindowControls.restore();
  });

  afterEach(() => {
    mockedWindowControls.reset();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('tunnistamoAuthCodeParserAction and keycloakAuthCodeParserAction parse the code from the return url', () => {
    it('Resolves code if the stored state matches the one in the callback url', async () => {
      const { runner, getTunnistamoAction, getKeycloadAction } = initTests();
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);

      const [, resultForKeycloak] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(resultForKeycloak).toBe(keycloakAuthCode);
      const [error, resultForTunnistamo] = await to(
        getTunnistamoAction().executor(getTunnistamoAction(), runner)
      );
      expect(error).toBeDefined();
      expect(resultForTunnistamo).toBeUndefined();

      // set return the tunnistamo parser is expecting
      setReturnUrl(tunnistamoAuthCode, correctTunnistamoState);
      const [, resultForTunnistamo2] = await to(
        getTunnistamoAction().executor(getTunnistamoAction(), runner)
      );

      expect(resultForTunnistamo2).toBe(tunnistamoAuthCode);

      const [error2, resultForKeycloak2] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(error2).toBeDefined();
      expect(resultForKeycloak2).toBeUndefined();
    });
    it('Resolves empty string when keycloak auth code is not needed', async () => {
      const { runner, getTunnistamoAction, getKeycloadAction } = initTests({
        noKeycloakScopes: true,
      });
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);

      const [, resultForKeycloak] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(resultForKeycloak).toBe('');

      // set return the tunnistamo parser is expecting
      setReturnUrl(tunnistamoAuthCode, correctTunnistamoState);

      const [, resultForTunnistamo] = await to(
        getTunnistamoAction().executor(getTunnistamoAction(), runner)
      );

      expect(resultForTunnistamo).toBe(tunnistamoAuthCode);

      const [, resultForKeycloak2] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(resultForKeycloak2).toBe('');
    });
    it('Resolves dummy auth code for tunnistamo when tunnistamo auth code is not needed', async () => {
      const { runner, getTunnistamoAction } = initTests({
        noTunnistamoScopes: true,
      });
      // set return the tunnistamo parser is expecting
      setReturnUrl(tunnistamoAuthCode, correctTunnistamoState);

      const [, resultForTunnistamo] = await to(
        getTunnistamoAction().executor(getTunnistamoAction(), runner)
      );

      expect(
        resultForTunnistamo && (resultForTunnistamo as string).length > 1
      ).toBeTruthy();
    });
    it('Rejects if the stored state does not match the one in the callback url', async () => {
      const { runner, getTunnistamoAction, getKeycloadAction } = initTests({
        useWrongKeycloakState: true,
      });
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);

      const [keycloakError] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(keycloakError).toBeDefined();

      // set return the tunnistamo parser is expecting
      setReturnUrl(tunnistamoAuthCode, correctTunnistamoState);
      const [, tunnistamoResult] = await to(
        getTunnistamoAction().executor(getTunnistamoAction(), runner)
      );
      expect(tunnistamoResult).toBeDefined();
    });
    it('Rejects the stored state is not found', async () => {
      const { runner, getKeycloadAction } = initTests({
        noKeycloakProps: true,
      });
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);

      const [keycloakError] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(keycloakError).toBeDefined();
    });
  });
  describe('getStoredTunnistamoAuthCode() and getStoredKeycloakAuthCode()', () => {
    it('getStoredKeycloakAuthCode() returns stored keycloak auth code or undefined', async () => {
      const { runner } = initTests({ setTunnistamoParserComplete: true });
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);
      expect(getStoredKeycloakAuthCode(runner)).toBeUndefined();

      runner.resume(keycloakAuthCodeParserAction.type);
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      expect(getStoredKeycloakAuthCode(runner)).toBe(keycloakAuthCode);
    });
    it('getStoredTunnistamoAuthCode() returns stored tunnistamo auth code or undefined', async () => {
      const { runner } = initTests();
      // set return the keycloak parser is expecting
      setReturnUrl(tunnistamoAuthCode, correctTunnistamoState);
      expect(getStoredKeycloakAuthCode(runner)).toBeUndefined();

      runner.resume(tunnistamoAuthCodeParserAction.type);
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });

      expect(getStoredTunnistamoAuthCode(runner)).toBe(tunnistamoAuthCode);
      expect(getStoredKeycloakAuthCode(runner)).toBeUndefined();
    });
  });
});
