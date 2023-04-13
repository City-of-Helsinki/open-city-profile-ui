import React, { useEffect, useMemo, useState } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { User } from 'oidc-client-ts';

import {
  mockUserCreator,
  MockedUserOverrides,
} from '../../common/test/userMocking';
import authService from '../authService';
import useProfile, { Profile } from '../useProfile';
import {
  useLoginClient,
  useLoginStateListener,
  Provider as LoginProvider,
  LoginContext,
  useAuthenticatedUser,
} from '../LoginContext';
import {
  LoginClient,
  LoginClientState,
  LoginClientStateChange,
} from '../login-client';
import { InitTestResult, createTestSuite } from './login-testing-util';
import { TokenData } from '../api-token-client';
import LoginClientError from '../login-client-error';

const {
  placeApiTokenToStorage,
  placeUserToStorage,
  mockSignInResponse,
  mockRefreshResponse,
  initTests,
  spyAndMockSigninRedirect,
  jumpToExpirationTime,
  waitForLogoutToFinish,
  waitForLoginToTimeout,
  createManualApiTokenCompletion,
  addApiTokenResponse,
  mockAddSessionPollerSpies,
  mockedSessionPollerFunctionsGetter,
  cleanUp,
  getApiTokenCalls,
  raiseUserUnloadedEvent,
  raiseUserSignedOutEvent,
  getDefaultLoginClientProps,
} = createTestSuite();

type DataGetters = {
  getState: () => LoginClientState | undefined;
  getTokens: () => TokenData | undefined;
  raiseUnloadEvent: () => void;
  runPrepareFunctions: () => Promise<void>;
};

type PrepareFunction = (loginClient: LoginClient) => Promise<void>;

const elementIds = {
  state: 'state-element',
  user: 'user-element',
  tokens: 'tokens-element',
  authError: 'auth-error-element',
  raiseUnloadEvent: 'unload-button',
  runFunctions: 'run-functions-button',
};

describe('LoginContext hook', () => {
  const previousStateIndicatorElementId = 'previous-state-element';
  const errorTypeIndicatorElementId = 'error-type-element';
  const loginButtonElementId = 'login-element';
  const logoutButtonElementId = 'logout-element';
  const stateListener1CallCountElementId = 'listener-1-element';
  //const stateListener2CallCountElementId = 'listener-2-element';
  //const stateListener3CallCountElementId = 'listener-2-element';
  const prepareFunctions: PrepareFunction[] = [];
  const stateListener1 = jest.fn();
  const errorListener = jest.fn();
  const expirationListener = jest.fn();
  const stateListener = (change: LoginClientStateChange) => {
    console.log('change', change.state, change.previousState);
    if (change.error) {
      console.log('change.error', change.error.type, change.error.message);
      errorListener(change.error);
    } else {
      stateListener1(change);
    }
  };
  const TestComponent = () => {
    console.log('RENDER TestComponent');
    const stateListener2 = useMemo(() => jest.fn(), []);
    const stateListener3 = useMemo(() => jest.fn(), []);
    const client = useLoginClient();
    const [user, tokens, authError] = useAuthenticatedUser();
    const { state, previousState, error } = useLoginStateListener(
      stateListener
    );
    //useLoginStateListener(stateListener2);
    //useLoginStateListener(stateListener3);

    client.getUserManager().events.addAccessTokenExpiring(expirationListener);

    return (
      <div>
        <span id={elementIds.state}>{state || ''}</span>
        <span id={previousStateIndicatorElementId}>{previousState || ''}</span>
        <span id={errorTypeIndicatorElementId}>{error ? error.type : ''}</span>
        <span id={stateListener1CallCountElementId}>
          {stateListener1.mock.calls.length}
        </span>
        <span id={elementIds.user}>{user ? user.profile.name : ''}</span>
        <span id={elementIds.tokens}>
          {tokens ? JSON.stringify(tokens) : ''}
        </span>
        <span id={elementIds.authError}>{authError ? authError.type : ''}</span>
        <button
          id={loginButtonElementId}
          onClick={() => {
            client.login();
          }}
        >
          Login
        </button>
        <button
          id={logoutButtonElementId}
          onClick={() => {
            client.logout();
          }}
        >
          Login
        </button>
        <button
          id={elementIds.raiseUnloadEvent}
          onClick={() => {
            raiseUserUnloadedEvent(client.getUserManager());
          }}
        >
          Login
        </button>
      </div>
    );
  };
  const TestController = () => {
    const client = useLoginClient();
    const [needsPreparation, updateNeedsPreparation] = useState(
      prepareFunctions.length > 0
    );
    const runFunctions = useMemo(
      () => async () => {
        for (const func of prepareFunctions) {
          console.log('RUN FUNC');
          await func(client).catch(err => {
            console.error(err);
          });
        }
        console.log('CLEAR FUNC');
        prepareFunctions.length = 0;
      },
      [client]
    );
    useEffect(() => {
      async function run() {
        await runFunctions();
        updateNeedsPreparation(false);
      }
      run();
    }, [runFunctions]);
    if (!needsPreparation) {
      return (
        <div>
          <button
            id={elementIds.runFunctions}
            onClick={async () => {
              console.log('CLICK');
              await runFunctions();
              console.log('DONE');
            }}
          >
            Run pending functions
          </button>
          <TestComponent />
        </div>
      );
    } else {
      return <div>preparing....</div>;
    }
  };
  const renderTestComponent = (): DataGetters => {
    const result = render(
      <LoginProvider
        loginProps={{ ...getDefaultLoginClientProps(), apiTokenMaxRetries: 0 }}
      >
        <TestController />
      </LoginProvider>
    );
    const { container } = result;
    const getElementById = (id: string) =>
      container.querySelector(`#${id}`) as HTMLElement;
    return {
      getState: () =>
        getElementById(elementIds.state).innerHTML as LoginClientState,
      raiseUnloadEvent: () =>
        fireEvent.click(getElementById(elementIds.raiseUnloadEvent)),
      getTokens: () => {
        const data = getElementById(elementIds.tokens).innerHTML;
        return data ? JSON.parse(data) : undefined;
      },
      runPrepareFunctions: async () => {
        fireEvent.click(getElementById(elementIds.runFunctions)),
          await waitFor(() => {
            expect(prepareFunctions).toHaveLength(0);
          });
      },
    };
  };

  afterEach(() => {
    jest.restoreAllMocks();
    prepareFunctions.length = 0;
  });
  describe('LoginContext hook', () => {
    it('....', async () => {
      //beforeEach(async () => await initTests({ validUser: true }));

      const { getState } = renderTestComponent();
      await waitFor(() => expect(getState()).toEqual('NO_SESSION'));
    });
    it('....2', async () => {
      //beforeEach(async () => await initTests({ validUser: true }));
      placeUserToStorage({});
      placeApiTokenToStorage({ token: 'token' });
      const { getState, getTokens } = renderTestComponent();
      //expect(getTokens()).not.toBeUndefined();
      await waitFor(() => expect(getState()).toEqual('VALID_SESSION'));
    });
  });
  describe('State changes are detected', () => {
    beforeEach(async () => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });
    it('user is unloaded', async () => {
      //beforeEach(async () => await initTests({ validUser: true }));
      placeUserToStorage({});
      placeApiTokenToStorage({ token: 'token' });
      const { getState, raiseUnloadEvent } = renderTestComponent();
      //expect(getTokens()).not.toBeUndefined();
      await waitFor(() => expect(getState()).toEqual('VALID_SESSION'));
      raiseUnloadEvent();
      await waitFor(() => expect(getState()).toEqual('NO_SESSION'));
    });
    it('renewal fails', async () => {
      //beforeEach(async () => await initTests({ validUser: true }));
      placeUserToStorage({});
      placeApiTokenToStorage({ token: 'token' });
      const { getState, runPrepareFunctions } = renderTestComponent();

      //expect(getTokens()).not.toBeUndefined();
      await waitFor(() => expect(getState()).toEqual('VALID_SESSION'));

      addApiTokenResponse(
        new LoginClientError('test error', 'INVALID_API_TOKENS')
      );
      //addApiTokenResponse({ token: 'token' });
      prepareFunctions.push(client => {
        mockRefreshResponse(client.getUserManager());
        return Promise.resolve();
      });
      await runPrepareFunctions();
      const callCount = stateListener1.mock.calls.length;
      jumpToExpirationTime();

      await waitFor(() => expect(expirationListener).toHaveBeenCalledTimes(1));
      await waitFor(() => {
        expect(stateListener1).toHaveBeenCalledTimes(callCount + 1);
        expect(errorListener).toHaveBeenCalledTimes(1);
      });
    });
  });
});
