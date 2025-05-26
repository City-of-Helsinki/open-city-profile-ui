import * as Sentry from '@sentry/react';
import i18n from 'i18next';
import { useOidcClient } from 'hds-react';

const origin = window.location.origin;

const NETWORK_ERROR = 'Network Error';

const useAuth = () => {
  const oidcClient = useOidcClient();
  const userManager = oidcClient.getUserManager();

  const logout = async (): Promise<void> => {
    await oidcClient.logout({
      extraQueryParams: { ui_locales: i18n.language },
    });
  };

  const changePassword = async (): Promise<void> => {
    let success = true;
    await userManager
      .signinRedirect({
        ui_locales: i18n.language,
        redirect_uri: `${origin}/password-change-callback`,
        extraQueryParams: {
          kc_action: 'UPDATE_PASSWORD',
        },
      })
      .catch((error) => {
        success = false;
        if (error.message !== NETWORK_ERROR) {
          Sentry.captureException(error);
        }
      });
    return success ? Promise.resolve() : Promise.reject();
  };

  const initiateTOTP = async (): Promise<void> => {
    let success = true;
    await userManager
      .signinRedirect({
        ui_locales: i18n.language,
        redirect_uri: `${origin}/otp-configuration-callback`, // otp-configuration-callback
        extraQueryParams: {
          kc_action: 'CONFIGURE_TOTP',
        },
      })
      .catch((error) => {
        success = false;
        if (error.message !== NETWORK_ERROR) {
          Sentry.captureException(error);
        }
      });
    return success ? Promise.resolve() : Promise.reject();
  };

  const disableTOTP = async (id: string | null): Promise<void> => {
    let success = true;

    await userManager
      .signinRedirect({
        ui_locales: i18n.language,
        redirect_uri: `${origin}/delete-credential-callback`, // otp-configuration-callback
        extraQueryParams: {
          kc_action: 'delete_credential:' + id,
        },
      })
      .catch((error) => {
        success = false;
        if (error.message !== NETWORK_ERROR) {
          Sentry.captureException(error);
        }
      });
    return success ? Promise.resolve() : Promise.reject();
  };

  return {
    isAuthenticated: oidcClient.isAuthenticated,
    login: oidcClient.login,
    logout,
    changePassword,
    initiateTOTP,
    disableTOTP,
  };
};

export default useAuth;
