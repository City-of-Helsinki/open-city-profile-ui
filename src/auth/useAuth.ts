import * as Sentry from '@sentry/react';
import i18n from 'i18next';
import { useOidcClient } from 'hds-react';

const origin = window.location.origin;

const useAuth = () => {
  const oidcClient = useOidcClient();
  const { getUser, signinRedirect } = oidcClient.getUserManager();

  const logout = async (): Promise<void> => {
    await oidcClient.logout({
      extraQueryParams: { ui_locales: i18n.language },
    });
  };

  const changePassword = async (): Promise<void> => {
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
  };

  return {
    getUser,
    isAuthenticated: oidcClient.isAuthenticated,
    login: oidcClient.login,
    logout,
    changePassword,
  };
};

export default useAuth;
