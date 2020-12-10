import authService, { API_TOKEN } from '../authService';

describe('authService', () => {
  const userManager = authService.userManager;
  const oidcUserKey = `oidc.user:${process.env.REACT_APP_OIDC_AUTHORITY}:${process.env.REACT_APP_OIDC_CLIENT_ID}`;

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('getUser', () => {
    it('should resolve to the user value which has been resolved from getUser', async () => {
      expect.assertions(1);
      const mockUser = { name: 'Sam Littel' };

      jest.spyOn(userManager, 'getUser').mockResolvedValueOnce(mockUser);

      const user = await authService.getUser();

      expect(user).toBe(mockUser);
    });
  });

  describe('getToken', () => {
    it('should get API_TOKENS from localStorage', () => {
      const getSpy = jest.spyOn(Storage.prototype, 'getItem');
      authService.getToken();

      expect(getSpy).toHaveBeenNthCalledWith(1, API_TOKEN);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if no token can be found', () => {
      jest.spyOn(authService, 'getToken').mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });

    it("should return false if oidc user from sessionStorage doesn't exist", () => {
      const apiTokens = '5ed3abc5-9b65-4879-8d09-3cd8499650ef';
      jest.spyOn(authService, 'getToken').mockReturnValue(apiTokens);
      sessionStorage.clear();

      expect(authService.isAuthenticated()).toBe(false);
    });

    it("should return false if oidc user from sessionStorage doesn't have an access_token property", () => {
      const apiTokens = '5ed3abc5-9b65-4879-8d09-3cd8499650ef';
      const invalidUser = JSON.stringify({});

      jest.spyOn(authService, 'getToken').mockReturnValue(apiTokens);
      sessionStorage.setItem(oidcUserKey, invalidUser);

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true if oidc user is valid and tokens are returned from getToken', () => {
      const apiToken = '5ed3abc5-9b65-4879-8d09-3cd8499650ef';
      const validUser = JSON.stringify({
        name: 'Mr. Louisa Tromp',
        access_token: '5ed3abc5-9b65-4879-8d09-3cd8499650ef',
      });

      jest.spyOn(authService, 'getToken').mockReturnValue(apiToken);
      localStorage.setItem(oidcUserKey, validUser);

      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('login', () => {
    it('should call signinRedirect from oidc with the provided path', () => {
      const path = '/applications';
      const signinRedirect = jest.spyOn(userManager, 'signinRedirect');

      authService.login(path);

      expect(signinRedirect).toHaveBeenNthCalledWith(1, { data: { path } });
    });
  });

  describe('endLogin', () => {
    beforeEach(() => {
      global.fetch.mockResponse(JSON.stringify({ data: {} }));
    });
    const access_token = 'db237bc3-e197-43de-8c86-3feea4c5f886';
    const mockUser = {
      name: 'Penelope Krajcik',
      access_token,
    };

    it('should call signinRedirectCallback from oidc', () => {
      const signinRedirectCallback = jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockImplementation(() => Promise.resolve(mockUser));

      authService.endLogin();

      expect(signinRedirectCallback).toHaveBeenCalledTimes(1);
    });

    it('should return the same user object returned from signinRedirectCallback', async () => {
      expect.assertions(1);
      jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockReturnValue(Promise.resolve(mockUser));

      const user = await authService.endLogin();

      expect(user).toBe(mockUser);
    });

    it('should call fetchApiToken with the user object', async () => {
      expect.assertions(1);
      jest.spyOn(authService, 'fetchApiToken');
      jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockResolvedValue(mockUser);

      await authService.endLogin();

      expect(authService.fetchApiToken).toHaveBeenNthCalledWith(1, mockUser);
    });

    it('should set the user in localStorage before the function returns', async () => {
      const setSpy = jest.spyOn(Storage.prototype, 'setItem');
      expect.assertions(1);
      jest
        .spyOn(userManager, 'signinRedirectCallback')
        .mockResolvedValue(mockUser);
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
    it('should call signoutRedirect from oidc', () => {
      const signoutRedirect = jest.spyOn(userManager, 'signoutRedirect');

      authService.logout();

      expect(signoutRedirect).toHaveBeenCalledTimes(1);
    });

    it('should remove the tokens from localStorage', async () => {
      expect.assertions(1);
      jest.spyOn(userManager, 'signoutRedirect').mockResolvedValue(undefined);
      const apiTokens = 'a8d56df4-7ae8-4fbf-bf73-f366cd6fc479';

      localStorage.setItem(API_TOKEN, apiTokens);
      await authService.logout();

      expect(localStorage.getItem(API_TOKEN)).toBeNull();
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
          [process.env.REACT_APP_PROFILE_AUDIENCE]:
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
              "Authorization": "bearer db237bc3-e197-43de-8c86-3feea4c5f886",
            },
          },
        ]
      `);
    });

    it('should call localStorage.setItem with the right arguments', async () => {
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
});
