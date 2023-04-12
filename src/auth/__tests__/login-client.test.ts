import { waitFor } from '@testing-library/react';

import apiTokens from '../../common/test/apiTokens.json';
import { API_TOKEN_SESSION_STORAGE_KEY, TokenData } from '../api-token-client';
import { HttpPoller, HttpPollerProps } from '../http-poller';
import { InitTestResult, createTestSuite } from './login-testing-util';

const {
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
} = createTestSuite();

// eslint-disable-next-line sonarjs/no-duplicate-string
const mockActualHttpPoller = jest.requireActual('../http-poller');
jest.mock('../http-poller', () => ({
  __esModule: true,
  default: (props: HttpPollerProps) => {
    const poller = mockActualHttpPoller.default(props) as HttpPoller;
    const mockSessionPollerFunctions = mockedSessionPollerFunctionsGetter();
    mockSessionPollerFunctions.removeMocks();
    mockAddSessionPollerSpies(poller);
    return poller;
  },
  isSuccessfulHttpResponse: (...args: unknown[]) =>
    mockActualHttpPoller.isSuccessfulHttpResponse(...args),
}));

describe('loginClient', () => {
  let testData: InitTestResult;
  afterEach(() => {
    cleanUp();
  });

  beforeAll(() => {
    //enableActualHttpPoller(jest.requireActual('../http-poller'));
  });

  describe('getUser', () => {
    beforeEach(async () => (testData = await initTests({ validUser: true })));
    it('should resolve to the user value which has been resolved from getUser', async () => {
      const { loginClient, currentUser } = testData;
      const user = loginClient.getUser();
      expect(user).toMatchObject(JSON.parse(currentUser.toStorageString()));
    });
  });

  describe('login', () => {
    beforeEach(async () => (testData = await initTests({ validUser: true })));
    it('should call signinRedirect from oidc with the provided path', async () => {
      const { userManager } = testData;
      const path = '/applications';
      const signinRedirect = jest.spyOn(userManager, 'signinRedirect');
      await waitForLoginToTimeout({ state: { path } });
      expect(signinRedirect).toHaveBeenNthCalledWith(1, {
        state: { path },
        extraQueryParams: {},
      });
    });
    it('should add language to the login url', async () => {
      const { userManager } = testData;
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
    it('should call signinRedirectCallback from oidc', async () => {
      const { loginClient, currentUser } = await initTests(
        { validUser: true },
        { apiTokenUrl: undefined }
      );
      const signinRedirectCallback = spyAndMockSigninRedirect(currentUser);

      await loginClient.handleCallback();

      expect(signinRedirectCallback).toHaveBeenCalledTimes(1);
    });

    it('should return the same user object returned from signinRedirectCallback', async () => {
      const { loginClient, currentUser } = await initTests(
        { validUser: true },
        { apiTokenUrl: undefined }
      );
      spyAndMockSigninRedirect(currentUser);

      const [user] = await loginClient.handleCallback();

      expect(user).toBe(currentUser);
    });

    it('should set the user to sessionStorage before the function returns', async () => {
      const { loginClient, userManager } = await initTests(
        { validUser: true },
        { apiTokenUrl: undefined }
      );
      const setSpy = jest.spyOn(Storage.prototype, 'setItem');
      mockSignInResponse(userManager);
      await loginClient.handleCallback();

      expect(setSpy).toHaveBeenCalledTimes(1);
    });

    it('should fetch apiTokens', async () => {
      const { loginClient, userManager } = await initTests({ validUser: true });
      addApiTokenResponse(apiTokens);
      mockSignInResponse(userManager);
      const [, tokens] = await loginClient.handleCallback();
      expect(getApiTokenCalls()).toHaveLength(1);
      expect(tokens).toMatchObject(apiTokens);
    });
  });
  describe('renewing user tokens', () => {
    beforeEach(async () => {
      testData = await initTests({ validUser: true });
      addApiTokenResponse(apiTokens);
      addApiTokenResponse({
        'https://api.hel.fi/auth/helsinkiprofile': 'renewedToken',
      });
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });
    it('renewal also fetches apiTokens', async () => {
      const { loginClient, userManager } = testData;
      const completeManualApiTokenFetch = createManualApiTokenCompletion();
      mockSignInResponse(userManager);
      mockRefreshResponse(userManager);
      const expirationListener = jest.fn();
      const loadListener = jest.fn();
      userManager.events.addAccessTokenExpiring(expirationListener);
      userManager.events.addUserLoaded(loadListener);

      const callbackPromise = loginClient.handleCallback();
      await waitFor(() => {
        expect(getApiTokenCalls()).toHaveLength(1);
      });
      completeManualApiTokenFetch();
      await callbackPromise;
      await waitFor(() => {
        expect(loadListener).toHaveBeenCalledTimes(1);
      });
      // login complete
      // renew
      const tokens = await loginClient.getUpdatedTokens();
      jumpToExpirationTime();
      const completeManualApiTokenFetch2 = createManualApiTokenCompletion();
      await waitFor(() => {
        expect(expirationListener).toHaveBeenCalledTimes(1);
        expect(loginClient.isRenewing()).toBeTruthy();
      });
      let middleOfRewalTokens: TokenData | null = null;
      completeManualApiTokenFetch2();
      const tokenPromise = loginClient
        .getUpdatedTokens()
        .then(returnedTokens => {
          middleOfRewalTokens = returnedTokens;
        });
      completeManualApiTokenFetch2();
      await waitFor(() => {
        expect(loadListener).toHaveBeenCalledTimes(2);
        expect(loginClient.isRenewing()).toBeFalsy();
      });
      // renewal complete
      await tokenPromise;
      await waitFor(() => {
        expect(!!middleOfRewalTokens).toBeTruthy();
      });
      const newTokens = await loginClient.getUpdatedTokens();
      expect(newTokens as TokenData).not.toMatchObject(tokens as TokenData);
      expect(newTokens as TokenData).toMatchObject(
        (middleOfRewalTokens as unknown) as TokenData
      );
    });
  });
  describe('Session polling ', () => {
    it('should start when .... is called and session is valid', async () => {
      placeUserToStorage();
      await initTests({ validUser: true }, { apiTokenUrl: undefined });
      expect(mockedSessionPollerFunctionsGetter().getStartCallCount()).toBe(1);
    });
    it('should not start when .... is called and session is invalid', async () => {
      await initTests({ validUser: false }, { apiTokenUrl: undefined });
      expect(mockedSessionPollerFunctionsGetter().getStartCallCount()).toBe(0);
    });
    it('should start in endLogin', async () => {
      const { loginClient, currentUser } = await initTests(
        { validUser: true },
        { apiTokenUrl: undefined }
      );
      spyAndMockSigninRedirect(currentUser);
      await loginClient.handleCallback();
      expect(mockedSessionPollerFunctionsGetter().getStartCallCount()).toBe(1);
    });
    it('should stop when user is unloaded', async () => {
      const { loginClient, currentUser } = await initTests(
        { validUser: true },
        { apiTokenUrl: undefined }
      );
      spyAndMockSigninRedirect(currentUser);
      await loginClient.handleCallback();
      await raiseUserUnloadedEvent();
      await waitFor(() => {
        expect(mockedSessionPollerFunctionsGetter().getStopCallCount()).toBe(1);
      });
    });
    it('should stop when user is signedOut', async () => {
      const { loginClient, currentUser } = await initTests(
        { validUser: true },
        { apiTokenUrl: undefined }
      );
      spyAndMockSigninRedirect(currentUser);
      await loginClient.handleCallback();
      await raiseUserSignedOutEvent();
      await waitFor(() => {
        expect(mockedSessionPollerFunctionsGetter().getStopCallCount()).toBe(1);
      });
    });
  });
  describe('logout', () => {
    beforeEach(async () => {
      testData = await initTests({ validUser: true });
      const { loginClient, currentUser } = testData;
      addApiTokenResponse(apiTokens);
      spyAndMockSigninRedirect(currentUser);
      await loginClient.handleCallback();
    });
    it('should call signoutRedirect from oidc. Language is found in extraQueryParams', async () => {
      const { userManager } = testData;
      const signoutRedirectSpy = jest.spyOn(userManager, 'signoutRedirect');
      await waitForLogoutToFinish({ language: 'sv' });
      expect(signoutRedirectSpy).toHaveBeenCalledTimes(1);
      expect(signoutRedirectSpy).toHaveBeenNthCalledWith(1, {
        extraQueryParams: {
          ui_locales: 'sv',
        },
      });
    });

    it('should remove the tokens from sessionStorage', async () => {
      expect(
        sessionStorage.getItem(API_TOKEN_SESSION_STORAGE_KEY)
      ).not.toBeNull();
      await waitForLogoutToFinish();
      expect(sessionStorage.getItem(API_TOKEN_SESSION_STORAGE_KEY)).toBeNull();
    });

    it('should remove user, tokens and stop polling', async () => {
      const { loginClient } = testData;
      await waitForLogoutToFinish();
      const [user, tokens] = loginClient.getStoredUserAndTokens();
      expect(user).toBeNull();
      expect(tokens).toBeNull();
      await waitFor(() => {
        expect(mockedSessionPollerFunctionsGetter().getStopCallCount()).toBe(1);
      });
    });
  });
});
