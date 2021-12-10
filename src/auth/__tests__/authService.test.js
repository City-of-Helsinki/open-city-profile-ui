import to from 'await-to-js';

import authService, { API_TOKEN } from '../authService';
import { getHttpPollerMockData } from '../__mocks__/http-poller';
import i18n from '../../common/test/testi18nInit';

describe('authService', () => {
  const userManager = authService.userManager;

  const setSession = ({ validUser, validApiToken, optionalUserProps }) => {
    const validAccessToken = 'db237bc3-e197-43de-8c86-3feea4c5f886';
    const oidcUserKey = `oidc.user:${window._env_.REACT_APP_OIDC_AUTHORITY}:${window._env_.REACT_APP_OIDC_CLIENT_ID}`;
    const sessionApiToken =
      validApiToken !== false ? '5ed3abc5-9b65-4879-8d09-3cd8499650eh' : null;
    const sessionUser = {
      name: 'Mr. Louisa Tromp',
      access_token: validUser !== false ? validAccessToken : '',
      expired: false,
      ...optionalUserProps,
    };
    jest.spyOn(authService, 'getToken').mockReturnValue(sessionApiToken);
    jest.spyOn(userManager, 'getUser').mockResolvedValue(sessionUser);
    sessionStorage.setItem(oidcUserKey, JSON.stringify(sessionUser));
    return {
      sessionUser,
      sessionApiToken,
    };
  };

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
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
      const getSpy = jest.spyOn(Storage.prototype, 'getItem');
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
        validToken: true,
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

  describe('login', () => {
    const defaultSigninParams = {
      data: { path: '/' },
      ui_locales: 'fi',
    };
    it('should call signinRedirect from oidc with the provided path', async () => {
      const path = '/applications';
      const signinRedirect = jest.spyOn(userManager, 'signinRedirect');

      await to(authService.login(path));

      expect(signinRedirect).toHaveBeenNthCalledWith(1, {
        ...defaultSigninParams,
        data: { path },
      });
    });
    it('should reflect i18n language changes in the login url', async () => {
      const signinRedirect = jest.spyOn(userManager, 'signinRedirect');
      i18n.changeLanguage('sv');
      await to(authService.login());
      expect(signinRedirect).toHaveBeenNthCalledWith(1, {
        ...defaultSigninParams,
        ui_locales: 'sv',
      });
    });
  });

  describe('endLogin', () => {
    let sessionUser;
    beforeEach(() => {
      global.fetch.mockResponse(JSON.stringify({ data: {} }));
      sessionUser = setSession({
        validApiToken: true,
        validUser: true,
      }).sessionUser;
    });

    it('should call signinRedirectCallback from oidc', () => {
      const signinRedirectCallback = jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockImplementation(() => Promise.resolve(sessionUser));

      authService.endLogin();

      expect(signinRedirectCallback).toHaveBeenCalledTimes(1);
    });

    it('should return the same user object returned from signinRedirectCallback', async () => {
      expect.assertions(1);
      jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockReturnValue(Promise.resolve(sessionUser));

      const user = await authService.endLogin();

      expect(user).toBe(sessionUser);
    });

    it('should call fetchApiToken with the user object', async () => {
      expect.assertions(1);
      jest.spyOn(authService, 'fetchApiToken');
      jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockResolvedValue(sessionUser);

      await authService.endLogin();

      expect(authService.fetchApiToken).toHaveBeenNthCalledWith(1, sessionUser);
    });

    it('should set the user in sessionStorage before the function returns', async () => {
      const setSpy = jest.spyOn(Storage.prototype, 'setItem');
      expect.assertions(1);
      jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockResolvedValue(sessionUser);
      jest.spyOn(authService, 'fetchApiToken');

      await authService.endLogin();

      expect(setSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('renewToken', () => {
    it('should call signinSilent from oidc', () => {
      const signinSilent = jest
        .spyOn(userManager, 'signinSilent')
        .mockResolvedValue();

      authService.renewToken();

      expect(signinSilent).toHaveBeenCalledTimes(1);
    });

    it('should resolve to the user value which has been resolved from signinSilent', async () => {
      expect.assertions(1);
      const mockUser = { name: 'Camilla Howe' };

      jest.spyOn(userManager, 'signinSilent').mockResolvedValueOnce(mockUser);

      const user = await authService.renewToken();

      expect(user).toBe(mockUser);
    });
  });

  describe('logout', () => {
    it('should call signoutRedirect from oidc. Ui_locales is found in extraQueryParams', () => {
      const signoutRedirect = jest.spyOn(userManager, 'signoutRedirect');
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
      jest.spyOn(userManager, 'signoutRedirect').mockResolvedValue(undefined);
      const apiTokens = 'a8d56df4-7ae8-4fbf-bf73-f366cd6fc479';

      sessionStorage.setItem(API_TOKEN, apiTokens);
      await authService.logout();

      expect(sessionStorage.getItem(API_TOKEN)).toBeNull();
    });

    it('should call clearStaleState', async () => {
      expect.assertions(1);
      jest.spyOn(userManager, 'signoutRedirect').mockResolvedValue(undefined);
      jest.spyOn(userManager, 'clearStaleState').mockResolvedValue();

      await authService.logout();

      expect(userManager.clearStaleState).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchApiToken', () => {
    const access_token = 'db237bc3-e197-43de-8c86-3feea4c5f886';
    const mockUser = {
      name: 'Penelope Krajcik',
      access_token,
    };

    beforeEach(() => {
      global.fetch.resetMocks();

      global.fetch.mockResponse(
        JSON.stringify({
          [window._env_.REACT_APP_PROFILE_AUDIENCE]:
            '71ffd52c-5985-46d3-b445-490554f4012a',
        })
      );
    });

    it('should call fetch with the right arguments', async () => {
      expect.assertions(2);
      await authService.fetchApiToken(mockUser);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "https://api.hel.fi/sso/openid/api-tokens/",
          Object {
            "headers": Object {
              "authorization": "bearer db237bc3-e197-43de-8c86-3feea4c5f886",
            },
          },
        ]
      `);
    });

    it('should call sessionStorage.setItem with the right arguments', async () => {
      const setSpy = jest.spyOn(Storage.prototype, 'setItem');
      expect.assertions(2);
      await authService.fetchApiToken(mockUser);

      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(setSpy.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "apiToken",
          "71ffd52c-5985-46d3-b445-490554f4012a",
        ]
      `);
    });
  });

  describe('getAuthenticatedUser', () => {
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
      expect(error).toBeDefined();
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
    it('should start when user is loaded', () => {
      userManager.events._userLoaded.raise({});
      expect(mockHttpPoller.start).toHaveBeenCalledTimes(1);
    });
    it('should stop when user is unloaded', () => {
      userManager.events._userUnloaded.raise();
      expect(mockHttpPoller.stop).toHaveBeenCalledTimes(1);
    });
    it('should stop when user is signedOut', () => {
      userManager.events._userSignedOut.raise();
      expect(mockHttpPoller.stop).toHaveBeenCalledTimes(1);
    });
  });
});
