/* eslint-disable @typescript-eslint/ban-ts-comment */
import to from 'await-to-js';
import { waitFor } from '@testing-library/react';
import { User } from 'oidc-client';

import authService, { API_TOKEN } from '../authService';
import {
  getHttpPollerMockData,
  enableActualHttpPoller,
} from '../__mocks__/http-poller';
import i18n from '../../common/test/testi18nInit';
import mockWindowLocation from '../../common/test/mockWindowLocation';
import * as HttpPoller from '../http-poller';

describe('authService', () => {
  const userManager = authService.userManager;
  const apiToken = '5ed3abc5-9b65-4879-8d09-3cd8499650eh';
  const accessToken = 'db237bc3-e197-43de-8c86-3feea4c5f886';

  const setSession = ({
    validUser,
    validApiToken,
    optionalUserProps,
  }: {
    validUser?: boolean;
    validApiToken?: boolean;
    optionalUserProps?: object;
  }) => {
    const oidcUserKey = `oidc.user:${window._env_.REACT_APP_OIDC_AUTHORITY}:${window._env_.REACT_APP_OIDC_CLIENT_ID}`;
    const sessionApiToken = validApiToken !== false ? apiToken : null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionUser: any = {
      name: 'Mr. Louisa Tromp',
      access_token: validUser !== false ? accessToken : '',
      expired: false,
      ...optionalUserProps,
    };
    vi.spyOn(authService, 'getToken').mockReturnValue(sessionApiToken);
    vi.spyOn(userManager, 'getUser').mockResolvedValue(sessionUser);
    sessionStorage.setItem(oidcUserKey, JSON.stringify(sessionUser));
    return {
      sessionUser,
      sessionApiToken,
    };
  };

  const spyAndMockSignoutRedirect = () =>
    vi.spyOn(userManager, 'signoutRedirect').mockImplementation(async () => {
      // mocking userManager: signout calls removeUser which triggers unload event
      // @ts-ignore
      await userManager.events._userUnloaded.raise();
      return Promise.resolve();
    });

  const mockFetchApiToken = () =>
    fetchMock.mockResponse(
      JSON.stringify({
        [window._env_.REACT_APP_PROFILE_AUDIENCE]: apiToken,
      })
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spyAndMockSigninRedirect = (user: any) =>
    vi
      .spyOn(userManager, 'signinRedirectCallback')
      .mockImplementation(() => Promise.resolve(user));

  const mockedWindowControls = mockWindowLocation();

  afterEach(() => {
    sessionStorage.clear();
    mockedWindowControls.restore();
    vi.restoreAllMocks();
  });

  describe('getUser', () => {
    it('should resolve to the user value which has been resolved from getUser', async () => {
      expect.assertions(1);
      const { sessionUser } = setSession({
        validUser: true,
        optionalUserProps: { name: 'Sam Littel' },
      });

      const user = await authService.getUser();

      expect(user).toBe(sessionUser);
    });
  });

  describe('getToken', () => {
    it('should get API_TOKENS from sessionStorage', () => {
      const getSpy = vi.spyOn(Storage.prototype, 'getItem');
      authService.getToken();

      expect(getSpy).toHaveBeenNthCalledWith(1, API_TOKEN);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if no token can be found', () => {
      setSession({
        validApiToken: false,
      });
      expect(authService.isAuthenticated()).toBe(false);
    });

    it("should return false if oidc user from sessionStorage doesn't exist", () => {
      setSession({
        validApiToken: true,
        validUser: true,
      });
      sessionStorage.clear();
      expect(authService.isAuthenticated()).toBe(false);
    });

    it("should return false if oidc user from sessionStorage doesn't have an access_token property", () => {
      setSession({
        validApiToken: true,
        validUser: true,
        optionalUserProps: { access_token: null },
      });

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true if oidc user is valid and tokens are returned from getToken', () => {
      setSession({ validApiToken: true, validUser: true });
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('isAuthenticatedUser', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let validUserObj: any;
    beforeEach(() => {
      validUserObj = setSession({
        validUser: true,
      }).sessionUser;
    });
    const getCurrentTimeInSeconds = () => Math.round(Date.now() / 1000);
    it('should return true if user is not expired and has access_token', () => {
      expect(authService.isAuthenticatedUser(validUserObj)).toBe(true);
    });
    it('should return false if user is not expired and access_token is not valid', () => {
      expect(
        authService.isAuthenticatedUser({ ...validUserObj, access_token: '' })
      ).toBe(false);
    });
    it('should return false if passed user is not a valid User object', () => {
      expect(authService.isAuthenticatedUser()).toBe(false);
      expect(authService.isAuthenticatedUser(null)).toBe(false);
      expect(authService.isAuthenticatedUser({} as User)).toBe(false);
    });
    it('should return true if user.expired is not set and time in user.expires_at has not passed', () => {
      expect(
        authService.isAuthenticatedUser({
          ...validUserObj,
          expired: undefined,
          expires_at: getCurrentTimeInSeconds() + 1000,
        })
      ).toBe(true);
    });
    it('should return false if user.expired is not set and time in user.expires_at has passed', () => {
      expect(
        authService.isAuthenticatedUser({
          ...validUserObj,
          expired: undefined,
          expires_at: getCurrentTimeInSeconds() - 1,
        })
      ).toBe(false);
    });
    it('should return !user.expired if it is set and ignore user.expires_at', () => {
      expect(
        authService.isAuthenticatedUser({
          ...validUserObj,
          expires_at: getCurrentTimeInSeconds() + 1000,
          expired: true,
        })
      ).toBe(false);
      expect(
        authService.isAuthenticatedUser({
          ...validUserObj,
          expires_at: 1,
          expired: false,
        })
      ).toBe(true);
    });
  });

  describe('login', () => {
    const defaultSigninParams = {
      data: { path: '/' },
      ui_locales: 'fi',
    };
    it('should call signinRedirect from oidc with the provided path', async () => {
      const path = '/applications';
      const signinRedirect = vi.spyOn(userManager, 'signinRedirect');

      await to(authService.login(path));

      expect(signinRedirect).toHaveBeenNthCalledWith(1, {
        ...defaultSigninParams,
        data: { path },
      });
    });
    it('should reflect i18n language changes in the login url', async () => {
      const signinRedirect = vi.spyOn(userManager, 'signinRedirect');
      i18n.changeLanguage('sv');
      await to(authService.login());
      expect(signinRedirect).toHaveBeenNthCalledWith(1, {
        ...defaultSigninParams,
        ui_locales: 'sv',
      });
    });
  });

  describe('endLogin', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sessionUser: any;
    beforeEach(() => {
      mockFetchApiToken();
      sessionUser = setSession({
        validApiToken: true,
        validUser: true,
      }).sessionUser;
    });

    it('should call signinRedirectCallback from oidc', async () => {
      const signinRedirectCallback = spyAndMockSigninRedirect(sessionUser);

      await authService.endLogin();

      expect(signinRedirectCallback).toHaveBeenCalledTimes(1);
    });

    it('should return the same user object returned from signinRedirectCallback', async () => {
      expect.assertions(1);
      spyAndMockSigninRedirect(sessionUser);

      const user = await authService.endLogin();

      expect(user).toBe(sessionUser);
    });

    it('should call fetchAndStoreApiToken with the user object', async () => {
      expect.assertions(1);
      vi.spyOn(authService, 'fetchAndStoreApiToken');
      vi.spyOn(userManager, 'signinRedirectCallback').mockResolvedValue(
        sessionUser
      );

      await authService.endLogin();

      expect(authService.fetchAndStoreApiToken).toHaveBeenNthCalledWith(
        1,
        sessionUser
      );
    });

    it('should set the user in sessionStorage before the function returns', async () => {
      const setSpy = vi.spyOn(Storage.prototype, 'setItem');
      expect.assertions(1);
      vi.spyOn(userManager, 'signinRedirectCallback').mockResolvedValue(
        sessionUser
      );

      await authService.endLogin();

      expect(setSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('renewToken', () => {
    it('should call signinSilent from oidc', () => {
      const signinSilent = vi
        .spyOn(userManager, 'signinSilent')
        .mockResolvedValue({} as User);

      authService.renewToken();

      expect(signinSilent).toHaveBeenCalledTimes(1);
    });

    it('should resolve to the user value which has been resolved from signinSilent', async () => {
      expect.assertions(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockUser: any = { name: 'Camilla Howe' };

      vi.spyOn(userManager, 'signinSilent').mockResolvedValueOnce(mockUser);

      const user = await authService.renewToken();

      expect(user).toBe(mockUser);
    });
  });

  describe('logout', () => {
    it('should call signoutRedirect from oidc. Ui_locales is found in extraQueryParams', () => {
      const signoutRedirect = vi.spyOn(userManager, 'signoutRedirect');
      i18n.changeLanguage('sv');
      authService.logout();

      expect(signoutRedirect).toHaveBeenCalledTimes(1);
      expect(signoutRedirect).toHaveBeenNthCalledWith(1, {
        extraQueryParams: {
          ui_locales: 'sv',
        },
      });
    });

    it('should remove the tokens from sessionStorage', async () => {
      expect.assertions(1);
      spyAndMockSignoutRedirect();
      const apiTokens = 'a8d56df4-7ae8-4fbf-bf73-f366cd6fc479';

      sessionStorage.setItem(API_TOKEN, apiTokens);
      await authService.logout();
      expect(sessionStorage.getItem(API_TOKEN)).toBeNull();
    });

    it('should call clearStaleState', async () => {
      expect.assertions(1);
      spyAndMockSignoutRedirect();
      vi.spyOn(userManager, 'clearStaleState').mockResolvedValue();

      await authService.logout();

      expect(userManager.clearStaleState).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchAndStoreApiToken', () => {
    const access_token = accessToken;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockUser: any = {
      name: 'Penelope Krajcik',
      access_token,
    };

    beforeEach(() => {
      fetchMock.resetMocks();
      mockFetchApiToken();
    });

    it('should call fetch with the right arguments', async () => {
      expect.assertions(2);
      await authService.fetchAndStoreApiToken(mockUser);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0]).toMatchInlineSnapshot(`
        [
          "https://api.hel.fi/sso/openid/api-tokens/",
          {
            "headers": {
              "authorization": "bearer ${accessToken}",
            },
          },
        ]
      `);
    });

    it('should call sessionStorage.setItem with the right arguments', async () => {
      const setSpy = vi.spyOn(Storage.prototype, 'setItem');
      expect.assertions(2);
      await authService.fetchAndStoreApiToken(mockUser);

      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(setSpy.mock.calls[0]).toMatchInlineSnapshot(`
        [
          "apiToken",
          "${apiToken}",
        ]
      `);
    });
  });

  // describe(`Api tokens are fetched again after user tokens are renewed.
  //           After silent renew completes, the _userLoaded event is raised and...`, () => {
  //   beforeEach(() => {
  //     fetchMock.resetMocks();
  //     mockFetchApiToken();
  //     vi.useFakeTimers();
  //   });

  //   afterEach(() => {
  //     vi.useRealTimers();
  //   });

  //   beforeAll(() => {
  //     enableActualHttpPoller(HttpPoller);
  //   });

  //   const defaultApiTokenPollIntervalInMs = 500;
  //   const requestCompletionInMs = defaultApiTokenPollIntervalInMs + 1;

  //   it('fetchApiToken is called and new token is stored when fetch is successful', async () => {
  //     const { sessionUser } = setSession({
  //       validUser: true,
  //       validApiToken: true,
  //     });
  //     sessionStorage.setItem(API_TOKEN, 'old token to be replaced');

  //     const fetcApiTokenSpy = vi.spyOn(authService, 'fetchApiToken');

  //     // @ts-ignore
  //     await userManager.events._userLoaded.raise(sessionUser);
  //     expect(fetcApiTokenSpy).toHaveBeenCalledTimes(1);
  //     vi.advanceTimersByTime(requestCompletionInMs);
  //     await waitFor(() => {
  //       expect(fetcApiTokenSpy).toHaveBeenCalledTimes(1);
  //       expect(sessionStorage.getItem(API_TOKEN)).toEqual(apiToken);
  //     });
  //   });
  //   it('fetchApiToken calls are retried until maxRetries is reached. Then authService.logout() is called', async () => {
  //     const { sessionUser } = setSession({
  //       validUser: true,
  //       validApiToken: true,
  //     });
  //     const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
  //     const logoutSpy = vi
  //       .spyOn(authService, 'logout')
  //       .mockResolvedValue(undefined);

  //     const fetcApiTokenSpy = vi
  //       .spyOn(authService, 'fetchApiToken')
  //       .mockImplementation(() => Promise.reject(new Error('Failed')));

  //     // @ts-ignore
  //     await userManager.events._userLoaded.raise(sessionUser);
  //     expect(fetcApiTokenSpy).toHaveBeenCalledTimes(1);
  //     vi.advanceTimersByTime(requestCompletionInMs);
  //     await waitFor(() => {
  //       expect(fetcApiTokenSpy).toHaveBeenCalledTimes(2);
  //     });
  //     vi.advanceTimersByTime(requestCompletionInMs);
  //     await waitFor(() => {
  //       expect(fetcApiTokenSpy).toHaveBeenCalledTimes(3);
  //     });
  //     vi.advanceTimersByTime(requestCompletionInMs);
  //     await waitFor(() => {
  //       expect(fetcApiTokenSpy).toHaveBeenCalledTimes(4);
  //     });
  //     vi.advanceTimersByTime(requestCompletionInMs);
  //     await waitFor(() => {
  //       expect(setItemSpy).not.toHaveBeenCalled();
  //       expect(fetcApiTokenSpy).toHaveBeenCalledTimes(5);
  //       expect(logoutSpy).toHaveBeenCalled();
  //     });
  //   });
  // });

  describe('getAuthenticatedUser ', () => {
    it('should resolve to the user value when user is valid', async () => {
      const { sessionUser } = setSession({
        validUser: true,
        validApiToken: true,
      });
      const [error, returnedUser] = await to(
        authService.getAuthenticatedUser()
      );
      expect(returnedUser).toEqual(sessionUser);
      expect(error).toBeNull();
    });
    it('should reject when user is invalid', async () => {
      setSession({ validUser: false });
      const [error, returnedUser] = await to(
        authService.getAuthenticatedUser()
      );
      expect(error).not.toBeNull();
      expect(returnedUser).toBeUndefined();
    });
  });

  describe('Session polling ', () => {
    const mockHttpPoller = getHttpPollerMockData();
    afterEach(() => {
      mockHttpPoller.start.mockReset();
      mockHttpPoller.stop.mockReset();
    });
    it('should start when authService.getAuthenticatedUser is called and session is valid', async () => {
      setSession({ validUser: true });
      await authService.getAuthenticatedUser();
      expect(mockHttpPoller.start).toHaveBeenCalled();
    });
    it('should not start when authService.getAuthenticatedUser is called and session is invalid', async () => {
      setSession({ validUser: false });
      await to(authService.getAuthenticatedUser());
      expect(mockHttpPoller.start).toHaveBeenCalledTimes(0);
    });
    // it('should start in endLogin', async () => {
    //   const { sessionUser } = setSession({
    //     validUser: true,
    //     validApiToken: true,
    //   });
    //   spyAndMockSigninRedirect(sessionUser);
    //   await authService.endLogin();
    //   expect(mockHttpPoller.start).toHaveBeenCalledTimes(1);
    // });
    it('should stop when user is unloaded', async () => {
      // @ts-ignore
      await userManager.events._userUnloaded.raise();
      await waitFor(() => {
        expect(mockHttpPoller.stop).toHaveBeenCalledTimes(1);
      });
    });
    it('should stop when user is signedOut', async () => {
      // @ts-ignore
      await userManager.events._userSignedOut.raise();
      await waitFor(() => {
        expect(mockHttpPoller.stop).toHaveBeenCalledTimes(1);
      });
    });
  });
});
