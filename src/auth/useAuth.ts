import { useCallback } from 'react';
import * as Sentry from '@sentry/react';
import i18n from 'i18next';
import { to } from 'await-to-js';
import { getApiTokensFromStorage, useOidcClient, User } from 'hds-react';

import pickProfileApiToken from './pickProfileApiToken';
import retryPollingUntilSuccessful from './http-poller-with-promises';

const origin = window.location.origin;

function isUserExpired(user?: Partial<User> | null): boolean {
  if (!user) {
    return true;
  }
  if (user.expired !== undefined) {
    return user.expired;
  }
  const expiresAtInSeconds = user.expires_at;

  if (expiresAtInSeconds) {
    return expiresAtInSeconds - Date.now() / 1000 <= 0;
  }
  return true;
}

const useAuth = () => {
  const oidcClient = useOidcClient();
  const { getUser, signinRedirect, removeUser } = oidcClient.getUserManager();

  const fetchApiToken = useCallback(async (user: User): Promise<
    Response | undefined
  > => {
    const url = `${window._env_.REACT_APP_OIDC_AUTHORITY}api-tokens/`;
    return fetch(url, {
      headers: {
        authorization: `bearer ${user.access_token}`,
      },
    });
  }, []);

  const parseApiTokenResponse = useCallback(async (response: Response): Promise<
    string
  > => {
    const result = await response.json();
    return pickProfileApiToken(result);
  }, []);

  const parseAndStoreApiToken = useCallback(
    async (response: Response | undefined): Promise<string | void> => {
      if (response) {
        const apiToken = await parseApiTokenResponse(response);
        // sessionStorage.setItem(API_TOKEN, apiToken);
        return Promise.resolve(apiToken);
      }
      return Promise.resolve();
    },
    [parseApiTokenResponse]
  );

  const fetchAndStoreApiToken = useCallback(
    async (user: User): Promise<boolean> => {
      const [, response] = await to(fetchApiToken(user));
      if (!response) {
        return Promise.resolve(false);
      }
      const apiToken = await parseAndStoreApiToken(response);
      return Promise.resolve(!!apiToken);
    },
    [fetchApiToken, parseAndStoreApiToken]
  );
  const getToken = useCallback((): string | null => {
    const apiTokens = getApiTokensFromStorage();
    if (apiTokens) {
      return pickProfileApiToken(apiTokens);
    }
    return null;
  }, []);

  const isAuthenticatedUser = useCallback(
    (user?: User | null): boolean =>
      !!user && !isUserExpired(user) && !!user.access_token,
    []
  );

  const isAuthenticated = useCallback((): boolean => {
    const userKey = `oidc.user:${window._env_.REACT_APP_OIDC_AUTHORITY}:${window._env_.REACT_APP_OIDC_CLIENT_ID}`;
    const oidcStorage = sessionStorage.getItem(userKey);
    const apiTokens = getToken();
    const parsedUser = oidcStorage && JSON.parse(oidcStorage);
    return isAuthenticatedUser(parsedUser) && !!apiTokens;
  }, [getToken, isAuthenticatedUser]);

  const logout = useCallback(async (): Promise<void> => {
    await oidcClient.logout({
      extraQueryParams: { ui_locales: i18n.language },
    });
  }, [oidcClient]);

  const endLogin = useCallback(
    async (user: User): Promise<User> => {
      if (!isAuthenticatedUser(user)) {
        return Promise.reject(
          new Error('Login failed - no valid user returned')
        );
      }
      const apiTokenSuccess = await fetchAndStoreApiToken(user);
      if (!apiTokenSuccess) {
        await removeUser();
        return Promise.reject(
          new Error('Api token error - no valid api token returned')
        );
      }

      return user;
    },
    [fetchAndStoreApiToken, isAuthenticatedUser, removeUser]
  );

  const changePassword = useCallback(async (): Promise<void> => {
    let success = true;
    await signinRedirect({
      ui_locales: i18n.language,
      redirect_uri: `${origin}/password-change-callback`,
      extraQueryParams: {
        kc_action: 'UPDATE_PASSWORD',
      },
    }).catch(error => {
      success = false;
      if (error.message !== 'Network Error') {
        Sentry.captureException(error);
      }
    });
    return success ? Promise.resolve() : Promise.reject();
  }, [signinRedirect]);

  return {
    getUser,
    isAuthenticated,
    endLogin,
    logout,
    changePassword,
  };
};

export default useAuth;
