import { OidcClient, SigninResponse, User, UserManager } from 'oidc-client-ts';
import fetchMock from 'jest-fetch-mock';
import { waitFor } from '@testing-library/react';

import createLoginClient, {
  LoginClient,
  LoginClientProps,
  LoginProps,
  LogoutProps,
  getUserStoreKey,
} from '../login-client';
import openIdConfiguration from '../../common/test/openIdConfiguration.json';
import { TokenData } from '../api-token-client';
import LoginClientError from '../login-client-error';
import { HttpPoller } from '../http-poller';

type TestProps = {
  validUser: boolean;
  userProps?: Partial<User>;
};

export type InitTestResult = {
  loginClient: LoginClient;
  userManager: UserManager;
  currentUser: User;
};

type UserCreationProps = {
  valid?: boolean;
  expired?: boolean;
};

type PublicUserManagerEvents = {
  _userUnloaded: {
    raise: () => Promise<void>;
  };
  _userSignedOut: {
    raise: () => Promise<void>;
  };
};

export function createTestSuite() {
  let loginClient: LoginClient;
  let userManager: UserManager;
  let currentUser: User;
  let mockManuallyTriggerApiTokenResult = false;

  const mockedApiTokenResponses: (TokenData | LoginClientError)[] = [];
  const authority = 'https://api.hel.fi/sso/openid';
  const client_id = 'test-client';
  const scope = 'openid profile';
  const accessToken = 'db237bc3-e197-43de-8c86-3feea4c5f886';
  const idToken = 'abcd1234-0000-43de-8c86-3feea4c5f886';
  const refreshToken = '1234zyxp-1111-43de-8c86-3feea4c5f886';
  const tokenExpirationTimeInSeconds = 100;
  const accessTokenExpiringNotificationTimeInSeconds = 10;
  const apiTokenFetchDelayInMs = 100;
  const sessionPollingIntervalInMs = 500;

  const defaultTestProps: LoginClientProps = {
    userManagerSettings: {
      authority,
      client_id,
      scope,
      accessTokenExpiringNotificationTimeInSeconds,
    },
    apiTokenUrl: `${window._env_.REACT_APP_OIDC_AUTHORITY}api-tokens/`,
    sessionPollingIntervalInMs,
  };

  const createSignInResponse = ({
    valid,
    expired,
  }: UserCreationProps): SigninResponse => {
    const nowAsSeconds = Math.round(Date.now() / 1000);
    const expires_in = expired !== true ? tokenExpirationTimeInSeconds : -1;
    const expires_at = nowAsSeconds + expires_in;
    return {
      access_token: valid !== false ? accessToken : '',
      code: 'code',
      error: null,
      error_description: null,
      error_uri: null,
      expires_at,
      id_token: valid !== false ? idToken : '',
      profile: {
        sub: 'sub',
        iss: 'issuer',
        aud: 'aud',
        exp: expires_at,
        iat: nowAsSeconds,
        name: 'Test User',
      },
      refresh_token: valid !== false ? refreshToken : '',
      scope,
      session_state: String(`${Math.random()}${Math.random()}`),
      state: '',
      token_type: 'Bearer',
      userState: {},
      expires_in,
      isOpenId: true,
    };
  };

  const createUser = (props: UserCreationProps = {}): User => {
    const response = createSignInResponse(props);
    const user = {
      ...response,
      expired: false,
    };
    return ({
      ...user,
      toStorageString() {
        return JSON.stringify(this);
      },
    } as unknown) as User;
  };

  const placeUserToUserManager = async (
    targetUserManager: UserManager,
    userProps: UserCreationProps = {}
  ) => {
    const user = createUser(userProps);
    await targetUserManager.storeUser(user);
    return Promise.resolve(user);
  };

  const placeUserToStorage = async (userProps: UserCreationProps = {}) => {
    const user = createUser(userProps);
    sessionStorage.setItem(
      getUserStoreKey({ authority, client_id }),
      JSON.stringify(user)
    );
    return user;
  };

  const removeUserFromStorage = async () => {
    sessionStorage.removeItem(getUserStoreKey({ authority, client_id }));
  };

  const mockSignInResponse = (
    targetUserManager: UserManager,
    userProps: UserCreationProps = {}
  ) => {
    const client = ((targetUserManager as unknown) as {
      _client: OidcClient;
    })._client;
    jest
      .spyOn(client, 'processSigninResponse')
      .mockImplementation(() =>
        Promise.resolve(createSignInResponse(userProps))
      );
  };

  const mockRefreshResponse = (
    targetUserManager: UserManager,
    userProps: UserCreationProps = {}
  ) => {
    const client = ((targetUserManager as unknown) as {
      _client: OidcClient;
    })._client;
    jest
      .spyOn(client, 'useRefreshToken')
      .mockImplementation(() =>
        Promise.resolve(createSignInResponse(userProps))
      );
  };

  const setSession = async ({
    validUser,
    userManager: currentUserManager,
    userProps,
  }: TestProps & { userManager: UserManager }): Promise<User> => {
    const user = await placeUserToUserManager(currentUserManager, {
      valid: validUser,
    });
    return user;
  };

  const getFetchCalls = (path: string) =>
    fetchMock.mock.calls.filter(call => {
      const url = call[0];
      return String(url).includes(path);
    });

  const getApiTokenCalls = () => getFetchCalls('api-tokens');

  const returnOpenIdConfiguration = () =>
    Promise.resolve({
      body: JSON.stringify(openIdConfiguration),
      headers: {
        'content-type': 'application/json',
      },
    });

  const returnApiTokens = (tokens?: TokenData | LoginClientError) =>
    tokens && !(tokens instanceof Error)
      ? Promise.resolve({
          body: JSON.stringify(tokens),
          status: 200,
        })
      : Promise.resolve({ status: 400 });

  const returnToken = () => {
    const response = JSON.stringify({
      access_token: '1d50132118664e568863a2263af4fd6d',
      refresh_token: '7c86f8b98ed64050a7b5c191bdf56934',
      token_type: 'bearer',
      expires_in: 3600,
      id_token: 'eyJmE2YmNiNmUtZWRjNi0xMWVhLTk2MjItYzJhNWQ3ODMxZjRlIiwiYXVkI',
    });
    return Promise.resolve({
      body: JSON.stringify(response),
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  fetchMock.mockResponse(req => {
    if (req.url.includes('well-known')) {
      return returnOpenIdConfiguration();
    }
    if (req.url.includes('api-tokens')) {
      const response = mockedApiTokenResponses.shift();
      if (mockManuallyTriggerApiTokenResult) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              body: JSON.stringify(response as TokenData),
              status: 200,
            });
          }, apiTokenFetchDelayInMs);
        });
      }
      return returnApiTokens(response);
    }
    if (req.url.includes('openid/token')) {
      return returnToken();
    }
    return Promise.reject(`Unknown url ${req.url}`);
  });

  const createManualApiTokenCompletion = (): (() => void) => {
    mockManuallyTriggerApiTokenResult = true;
    return () => {
      mockManuallyTriggerApiTokenResult = false;
      jest.advanceTimersByTime(apiTokenFetchDelayInMs + 1);
    };
  };

  // loginClient.login redirects the browser.
  // The returned promise is never resolved.
  async function waitForLoginToTimeout(loginProps?: LoginProps) {
    await expect(() =>
      waitFor(() => loginClient.login(loginProps), {
        timeout: 1000,
      })
    ).rejects.toThrow();
  }

  // loginClient.logout redirects the browser.
  // The returned promise is never resolved.
  async function waitForLogoutToFinish(logoutProps?: LogoutProps) {
    await expect(() =>
      waitFor(() => loginClient.logout(logoutProps), { timeout: 1000 })
    ).rejects.toThrow();
  }

  const jumpToExpirationTime = () => {
    jest.advanceTimersByTime(
      (tokenExpirationTimeInSeconds -
        accessTokenExpiringNotificationTimeInSeconds) *
        1000 +
        5000
    );
  };

  const spyAndMockSigninRedirect = (user: User) =>
    jest
      .spyOn(userManager, 'signinRedirectCallback')
      .mockImplementation(() => Promise.resolve(user));

  const initTests = async (
    testProps: TestProps,
    additionalLoginClientProps?: Partial<LoginClientProps>
  ): Promise<InitTestResult> => {
    const loginClientProps = {
      ...defaultTestProps,
      ...additionalLoginClientProps,
    };
    loginClient = createLoginClient(loginClientProps);
    userManager = loginClient.getUserManager();
    currentUser = await setSession({ ...testProps, userManager });
    return { loginClient, userManager, currentUser };
  };

  // awkward name because objects used inside mocks must start with "mock"
  const mockSpyOnSessionPoller = (sessionPoller: HttpPoller) => {
    const startSpy = jest.spyOn(sessionPoller, 'start');
    const stopSpy = jest.spyOn(sessionPoller, 'stop');
    return {
      removeMocks: () => {
        startSpy.mockRestore();
        stopSpy.mockRestore();
      },
      getStartCallCount: () => startSpy.mock.calls.length,
      getStopCallCount: () => stopSpy.mock.calls.length,
      jumpToNextPoll: () => {
        jest.advanceTimersByTime(sessionPollingIntervalInMs + 1);
      },
    };
  };

  const resetSessionPollerSpy = () => ({
    removeMocks: jest.fn(),
    getStartCallCount: () => 0,
    getStopCallCount: () => 0,
    jumpToNextPoll: () => {
      throw new Error('poller not used');
    },
  });

  let mockSessionPollerFunctions: ReturnType<typeof mockSpyOnSessionPoller> = resetSessionPollerSpy();

  // awkward name because objects used inside mocks must start with "mock"
  const mockedSessionPollerFunctionsGetter = () => mockSessionPollerFunctions;
  // awkward name because objects used inside mocks must start with "mock"
  const mockAddSessionPollerSpies = (sessionPoller: HttpPoller) => {
    mockSessionPollerFunctions = mockSpyOnSessionPoller(sessionPoller);
  };
  const removeSessionPollerSpies = () => {
    if (mockSessionPollerFunctions) {
      mockSessionPollerFunctions.removeMocks();
    }
    mockSessionPollerFunctions = resetSessionPollerSpy();
  };
  const getCurrentUser = () => currentUser;
  const addApiTokenResponse = (response: TokenData | LoginClientError) =>
    mockedApiTokenResponses.push(response);

  const getLoginClient = () => loginClient;
  const getUserManager = () => loginClient.getUserManager();

  const cleanUp = () => {
    removeSessionPollerSpies();
    sessionStorage.clear();
    loginClient.cleanUp();
    jest.restoreAllMocks();
    mockSessionPollerFunctions.removeMocks();
    mockedApiTokenResponses.length = 0;
    mockManuallyTriggerApiTokenResult = false;
  };

  // await ((userManager.events as unknown) as PublicUserManagerEvents)._userUnloaded.raise();

  const raiseUserUnloadedEvent = () =>
    ((userManager.events as unknown) as PublicUserManagerEvents)._userUnloaded.raise();

  const raiseUserSignedOutEvent = () =>
    ((userManager.events as unknown) as PublicUserManagerEvents)._userSignedOut.raise();

  return {
    createSignInResponse,
    createUser,
    placeUserToStorage,
    removeUserFromStorage,
    mockSignInResponse,
    mockRefreshResponse,
    setSession,
    initTests,
    spyAndMockSigninRedirect,
    jumpToExpirationTime,
    waitForLogoutToFinish,
    waitForLoginToTimeout,
    createManualApiTokenCompletion,
    getCurrentUser,
    addApiTokenResponse,
    mockAddSessionPollerSpies,
    mockedSessionPollerFunctionsGetter,
    removeSessionPollerSpies,
    cleanUp,
    getApiTokenCalls,
    getLoginClient,
    getUserManager,
    mockSpyOnSessionPoller,
    resetSessionPollerSpy,
    raiseUserUnloadedEvent,
    raiseUserSignedOutEvent,
  };
}