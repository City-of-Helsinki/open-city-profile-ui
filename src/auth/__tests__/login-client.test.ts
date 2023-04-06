/* eslint-disable jest/no-interpolation-in-snapshots */
import to from 'await-to-js';
import { waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import {
  OidcClient,
  SigninResponse,
  User,
  UserManager,
  UserManagerSettings,
} from 'oidc-client-ts';

import {
  getHttpPollerMockData,
  enableActualHttpPoller,
} from '../__mocks__/http-poller';
import i18n from '../../common/test/testi18nInit';
import openIdConfiguration from '../../common/test/openIdConfiguration.json';
import apiTokens from '../../common/test/apiTokens.json';
import { getAllLastMockCallArgs } from '../../common/test/jestMockHelper';
import createLoginClient, {
  LoginClient,
  LoginClientProps,
  LoginProps,
} from '../login-client';
import { TokenData } from '../api-token-client';
import LoginClientError from '../login-client-error';

type TestProps = {
  validUser: boolean;
  userProps?: Partial<User>;
};

type UserCreationProps = {
  valid?: boolean;
  expired?: boolean;
};

const mockedApiTokenResponses: (TokenData | LoginClientError)[] = [];
let mockedApiTokens: TokenData | undefined;
const mockApiTokenClientCalls = {
  fetch: jest.fn(),
  getToken: jest.fn(),
  getTokens: jest.fn(),
  clear: jest.fn(),
  constructor: jest.fn(),
};
jest.mock('../api-token-client', () => ({
  __esModule: true,
  default: (...constructorArgs: unknown[]) => {
    mockApiTokenClientCalls.constructor(...constructorArgs);
    return {
      fetch: (...args: unknown[]) => {
        mockApiTokenClientCalls.fetch(...args);
        const response = mockedApiTokenResponses.shift();
        if (!response) {
          return Promise.reject(new Error('API_TOKEN_NETWORK_OR_CORS_ERROR'));
        }
        if (response instanceof Error) {
          return Promise.reject(response);
        }
        mockedApiTokens = response;
        return Promise.resolve(response);
      },
      getToken: (name: string) => {
        mockApiTokenClientCalls.getToken(name);
        return mockedApiTokens ? mockedApiTokens[name] : undefined;
      },
      getTokens: () => {
        mockApiTokenClientCalls.getTokens();
        return mockedApiTokens;
      },
      clear: () => {
        mockApiTokenClientCalls.clear();
      },
    };
  },
}));

describe('authService', () => {
  let loginClient: LoginClient;
  let userManager: UserManager;
  let currentUser: User;
  const authority = 'https://api.hel.fi/sso/openid';
  const client_id = 'test-client';
  const scope = 'openid profile';
  const apiToken = Object.values(apiTokens)[0];
  const accessToken = 'db237bc3-e197-43de-8c86-3feea4c5f886';
  const idToken = 'abcd1234-0000-43de-8c86-3feea4c5f886';
  const refreshToken = '1234zyxp-1111-43de-8c86-3feea4c5f886';

  const defaultTestProps: LoginClientProps = {
    userManagerSettings: {
      authority,
      client_id,
      scope,
    },
    apiTokenUrl: `${window._env_.REACT_APP_OIDC_AUTHORITY}api-tokens/`,
    sessionPollingIntervalInMs: 500,
  };

  const createSignInResponse = ({
    valid,
    expired,
  }: UserCreationProps): SigninResponse => {
    const nowAsSeconds = Math.round(Date.now() / 1000);
    const expires_in = expired !== false ? 10000 : -1;
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
        sub: '',
        iss: '',
        aud: '',
        exp: 10000,
        iat: 10000,
        name: 'Test User',
      },
      refresh_token: valid !== false ? refreshToken : '',
      scope,
      session_state: null,
      state: '',
      token_type: 'Bearer',
      userState: {},
      expires_in,
      isOpenId: false,
    };
  };

  const getUser = (props: UserCreationProps = {}): User => {
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
    const user = getUser(userProps);
    await targetUserManager.storeUser(user);
    return Promise.resolve(user);
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
      .mockResolvedValue(createSignInResponse(userProps));
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

  const initTests = async (
    testProps: TestProps,
    additionalLoginClientProps?: Partial<LoginClientProps>
  ): Promise<User> => {
    const loginClientProps = {
      ...defaultTestProps,
      ...additionalLoginClientProps,
    };
    loginClient = createLoginClient(loginClientProps);
    userManager = loginClient.getUserManager();
    currentUser = await setSession({ ...testProps, userManager });
    return currentUser;
  };

  const returnOpenIdConfiguration = () =>
    Promise.resolve({
      body: JSON.stringify(openIdConfiguration),
      headers: {
        'content-type': 'application/json',
      },
    });

  const returnApiTokens = () =>
    Promise.resolve({
      body: JSON.stringify(apiTokens),
    });

  const returnGraphQl = () => {
    const response = JSON.stringify({
      [window._env_.REACT_APP_PROFILE_AUDIENCE]: apiToken,
    });
    return Promise.resolve({ body: JSON.stringify(response) });
  };

  const callLog = {
    wellKnown: 0,
    apiTokens: 0,
    graphql: 0,
    log(key: 'wellKnown' | 'apiTokens' | 'graphql') {
      this[key] = this[key] + 1;
    },
    clear() {
      this.apiTokens = 0;
      this.graphql = 0;
      this.wellKnown = 0;
    },
  };

  fetchMock.mockResponse(req => {
    if (req.url.includes('well-known')) {
      callLog.log('wellKnown');
      return returnOpenIdConfiguration();
    }
    if (req.url.includes('api-tokens')) {
      callLog.log('apiTokens');
      return returnApiTokens();
    }
    if (req.url.includes('graphql')) {
      callLog.log('graphql');
      return returnGraphQl();
    }
    return Promise.reject(`Unknown url ${req.url}`);
  });

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
  async function waitForLogoutToFinish() {
    await expect(() =>
      waitFor(() => loginClient.logout(), { timeout: 1000 })
    ).rejects.toThrow();
  }

  const spyAndMockSigninRedirect = (user: User) =>
    jest
      .spyOn(userManager, 'signinRedirectCallback')
      .mockImplementation(() => Promise.resolve(user));

  const spyAndMockClientResponse = (targetUserManager: {
    _client: OidcClient;
  }) => {
    const client = targetUserManager._client;
    //console.log('client', client.processSigninResponse);
    jest
      .spyOn(client, 'processSigninResponse')
      .mockResolvedValue(createSignInResponse({}));
  };

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
    callLog.clear();
    mockedApiTokenResponses.length = 0;
  });

  describe('getUser', () => {
    beforeEach(async () => initTests({ validUser: true }));
    it('should resolve to the user value which has been resolved from getUser', async () => {
      const user = loginClient.getUser();
      expect(user).toMatchObject(JSON.parse(currentUser.toStorageString()));
    });
  });

  describe('login', () => {
    beforeEach(async () => initTests({ validUser: true }));
    it('should call signinRedirect from oidc with the provided path', async () => {
      const path = '/applications';
      const signinRedirect = jest.spyOn(userManager, 'signinRedirect');
      await waitForLoginToTimeout({ state: { path } });
      expect(signinRedirect).toHaveBeenNthCalledWith(1, {
        state: { path },
        extraQueryParams: {},
      });
    });
    it('should add language to the login url', async () => {
      const signinRedirect = jest.spyOn(userManager, 'signinRedirect');
      await waitForLoginToTimeout({ language: 'sv' });
      expect(signinRedirect).toHaveBeenNthCalledWith(1, {
        extraQueryParams: {
          ui_locales: 'sv',
        },
      });
    });
  });

  describe('handleCallback', () => {
    beforeEach(async () => {
      await initTests({ validUser: true });
      mockedApiTokenResponses.push(apiTokens);
    });
    it('should call signinRedirectCallback from oidc', async () => {
      const signinRedirectCallback = spyAndMockSigninRedirect(currentUser);

      await loginClient.handleCallback();

      expect(signinRedirectCallback).toHaveBeenCalledTimes(1);
    });

    it('should return the same user object returned from signinRedirectCallback', async () => {
      spyAndMockSigninRedirect(currentUser);

      const user = await loginClient.handleCallback();

      expect(user).toBe(currentUser);
    });

    it('should set the user to sessionStorage before the function returns', async () => {
      const setSpy = jest.spyOn(Storage.prototype, 'setItem');
      spyAndMockClientResponse(userManager as any);
      /*jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockResolvedValue(currentUser);
      */
      await loginClient.handleCallback();

      expect(setSpy).toHaveBeenCalledTimes(1);
    });
  });
});
