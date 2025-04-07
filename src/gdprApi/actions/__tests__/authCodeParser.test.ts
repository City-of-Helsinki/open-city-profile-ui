import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { getGdprQueryScopesAction } from '../getGdprScopes';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import {
  keycloakAuthCodeParserAction,
  getStoredKeycloakAuthCode,
} from '../authCodeParser';
import { keycloakRedirectionInitializationAction } from '../authCodeRedirectionInitialization';
import mockWindowLocation from '../../../common/test/mockWindowLocation';

describe('authCodeParser.ts', () => {
  const mockedWindowControls = mockWindowLocation();
  const correctKeycloakState = 'correct-keycloak-state';
  const wrongKeycloakState = 'wrong-keycloak-state';
  const keycloakAuthCode = 'keycloak-auth-code';

  const initTests = ({
    noKeycloakScopes,
    noKeycloakProps,
    useWrongKeycloakState,
  }: {
    noKeycloakScopes?: boolean;
    noKeycloakProps?: boolean;
    useWrongKeycloakState?: boolean;
  } = {}) => {
    const queue = [
      getGdprQueryScopesAction,
      keycloakRedirectionInitializationAction,
      keycloakAuthCodeParserAction,
    ];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(getGdprQueryScopesAction.type, {
      result: {
        keycloakScopes: noKeycloakScopes ? [] : ['scope'],
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
    return {
      runner,
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
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });
  describe('keycloakAuthCodeParserAction parse the code from the return url', () => {
    it('Resolves code if the stored state matches the one in the callback url', async () => {
      const { runner, getKeycloadAction } = initTests();
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);

      const [, resultForKeycloak] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(resultForKeycloak).toBe(keycloakAuthCode);

      // set return that keycloak parser is not expecting
      setReturnUrl('somethingwrong', wrongKeycloakState);

      const [error2, resultForKeycloak2] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(error2).toBeDefined();
      expect(resultForKeycloak2).toBeUndefined();
    });

    it('Resolves empty string when keycloak auth code is not needed', async () => {
      const { runner, getKeycloadAction } = initTests({
        noKeycloakScopes: true,
      });
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);

      const [, resultForKeycloak] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(resultForKeycloak).toBe('');

      const [, resultForKeycloak2] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(resultForKeycloak2).toBe('');
    });

    it('Rejects if the stored state does not match the one in the callback url', async () => {
      const { runner, getKeycloadAction } = initTests({
        useWrongKeycloakState: true,
      });
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);

      const [keycloakError] = await to(
        getKeycloadAction().executor(getKeycloadAction(), runner)
      );
      expect(keycloakError).toBeDefined();
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
  describe(' getStoredKeycloakAuthCode()', () => {
    it('getStoredKeycloakAuthCode() returns stored keycloak auth code or undefined', async () => {
      const { runner } = initTests();
      // set return the keycloak parser is expecting
      setReturnUrl(keycloakAuthCode, correctKeycloakState);
      expect(getStoredKeycloakAuthCode(runner)).toBeUndefined();

      runner.resume(keycloakAuthCodeParserAction.type);
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      expect(getStoredKeycloakAuthCode(runner)).toBe(keycloakAuthCode);
    });
  });
});
