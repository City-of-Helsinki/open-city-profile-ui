import { useState, useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import HttpStatusCode from 'http-status-typed';
import i18n from 'i18next';
import { to } from 'await-to-js';
import { getApiTokensFromStorage, useOidcClient, User } from 'hds-react';

import pickProfileApiToken from './pickProfileApiToken';
import createHttpPoller, { HttpPoller } from './http-poller';
import retryPollingUntilSuccessful from './http-poller-with-promises';

const origin = window.location.origin;
export const API_TOKEN = 'apiToken';

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
  /* const [userManager] = useState(() => {
    const settings: UserManagerSettings = {
      automaticSilentRenew: true,
      validateSubOnSilentRenew: false,
      includeIdTokenInSilentRenew: false,
      monitorSession: true,
      filterProtocolClaims: false,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      authority: window._env_.REACT_APP_OIDC_AUTHORITY,
      client_id: window._env_.REACT_APP_OIDC_CLIENT_ID,
      redirect_uri: `${origin}/callback`,
      silent_redirect_uri: `${origin}/silent_renew.html`,
      response_type: window._env_.REACT_APP_OIDC_RESPONSE_TYPE,
      scope: window._env_.REACT_APP_OIDC_SCOPE,
      post_logout_redirect_uri: `${origin}/`,
    };

    if (window._env_.NODE_ENV === 'development') {
      Log.setLogger(console);
      Log.setLevel(Log.INFO);
    }

    return new UserManager(settings);
  }); */

  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  const oidcClient = useOidcClient();
  const userManager = oidcClient.getUserManager();

  const userInfoFetchFunction = useCallback(async (): Promise<
    Response | undefined
  > => {
    const uri = await userManager.metadataService.getUserInfoEndpoint();
    const user = await userManager.getUser();
    const accessToken = user && user.access_token;
    if (!accessToken) {
      return Promise.reject(new Error('Access token not set'));
    }
    const headers = new Headers();
    headers.append('authorization', `Bearer ${accessToken}`);
    return fetch(uri, {
      method: 'GET',
      headers,
    });
  }, [userManager]);

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
        sessionStorage.setItem(API_TOKEN, apiToken);
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
    /*
    await userManager.signoutRedirect({
      extraQueryParams: { ui_locales: i18n.language },
    }); */
  }, [oidcClient]);

  const [userSessionValidityPoller] = useState(() =>
    createHttpPoller({
      pollFunction: userInfoFetchFunction,
      shouldPoll: () => isAuthenticated(),
      onError: returnedHttpStatus => {
        if (
          isAuthenticated() &&
          returnedHttpStatus &&
          (returnedHttpStatus === HttpStatusCode.FORBIDDEN ||
            returnedHttpStatus === HttpStatusCode.UNAUTHORIZED)
        ) {
          logout();
          return { keepPolling: false };
        }
        return { keepPolling: isAuthenticated() };
      },
    })
  );

  const cleanUpUserSessionAndApiTokens = useCallback(async (): Promise<
    void
  > => {
    await userManager.clearStaleState();
    sessionStorage.removeItem(API_TOKEN);
    userSessionValidityPoller.stop();
  }, [userManager, userSessionValidityPoller]);

  useEffect(() => {
    const handleAccessTokenExpired = () => {
      logout();
    };

    const handleUserSignedOut = async () => {
      await cleanUpUserSessionAndApiTokens();
    };

    const handleUserLoaded = async (user: User) => {
      if (!isProcessingLogin && isAuthenticatedUser(user)) {
        const [, response] = await to(
          retryPollingUntilSuccessful({
            pollFunction: async () => fetchApiToken(user),
            pollIntervalInMs: 500,
            maxRetries: 4,
          })
        );
        if (response) {
          await parseAndStoreApiToken(response);
        } else {
          logout();
        }
      }
    };

    const handleUserUnloaded = async () => {
      await cleanUpUserSessionAndApiTokens();
    };

    userManager.events.addAccessTokenExpired(handleAccessTokenExpired);
    userManager.events.addUserSignedOut(handleUserSignedOut);
    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);

    return () => {
      userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
      userManager.events.removeUserSignedOut(handleUserSignedOut);
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
    };
  }, [
    userManager,
    isProcessingLogin,
    logout,
    cleanUpUserSessionAndApiTokens,
    isAuthenticatedUser,
    fetchApiToken,
    parseAndStoreApiToken,
  ]);

  const getUser = useCallback(
    (): Promise<User | null> => userManager.getUser(),
    [userManager]
  );

  const login = useCallback(
    async (path = '/'): Promise<void> => {
      let success = true;
      await userManager
        .signinRedirect({
          state: { path },
          ui_locales: i18n.language,
        })
        .catch(error => {
          success = false;
          if (error.message !== 'Network Error') {
            Sentry.captureException(error);
          }
        });
      return success ? Promise.resolve() : Promise.reject();
    },
    [userManager]
  );

  const endLogin = useCallback(
    async (user: User): Promise<User> => {
      setIsProcessingLogin(true);
      if (!isAuthenticatedUser(user)) {
        return Promise.reject(
          new Error('Login failed - no valid user returned')
        );
      }
      const apiTokenSuccess = await fetchAndStoreApiToken(user);
      if (!apiTokenSuccess) {
        await userManager.removeUser();
        return Promise.reject(
          new Error('Api token error - no valid api token returned')
        );
      }
      setIsProcessingLogin(false);
      userSessionValidityPoller.start();
      return user;
    },
    [
      isAuthenticatedUser,
      fetchAndStoreApiToken,
      userManager,
      userSessionValidityPoller,
    ]
  );

  const changePassword = useCallback(async (): Promise<void> => {
    let success = true;
    await userManager
      .signinRedirect({
        ui_locales: i18n.language,
        redirect_uri: `${origin}/password-change-callback`,
        extraQueryParams: {
          kc_action: 'UPDATE_PASSWORD',
        },
      })
      .catch(error => {
        success = false;
        if (error.message !== 'Network Error') {
          Sentry.captureException(error);
        }
      });
    return success ? Promise.resolve() : Promise.reject();
  }, [userManager]);

  return {
    getUser,
    getToken,
    isAuthenticated,
    login: oidcClient.login,
    endLogin,
    logout,
    changePassword,
    getAuthenticatedUser: async (): Promise<User | null> => {
      const user = await getUser();
      if (!isAuthenticatedUser(user)) {
        return Promise.reject(new Error('User not authenticated'));
      }
      userSessionValidityPoller.start();
      return Promise.resolve(user);
    },
  };
};

export default useAuth;
