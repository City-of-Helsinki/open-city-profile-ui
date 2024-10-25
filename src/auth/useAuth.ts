import { useCallback } from 'react';
import * as Sentry from '@sentry/react';
import i18n from 'i18next';
import { to } from 'await-to-js';
import { useOidcClient, User } from 'hds-react';

import pickProfileApiToken from './pickProfileApiToken';

const origin = window.location.origin;

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

  const isAuthenticated = () => oidcClient.isAuthenticated();

  const logout = useCallback(async (): Promise<void> => {
    await oidcClient.logout({
      extraQueryParams: { ui_locales: i18n.language },
    });
  }, [oidcClient]);

  const endLogin = useCallback(
    async (user: User): Promise<User> => {
      const apiTokenSuccess = await fetchAndStoreApiToken(user);
      if (!apiTokenSuccess) {
        await removeUser();
        return Promise.reject(
          new Error('Api token error - no valid api token returned')
        );
      }

      return user;
    },
    [fetchAndStoreApiToken, removeUser]
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
    login: oidcClient.login,
    endLogin,
    logout,
    changePassword,
  };
};

export default useAuth;
