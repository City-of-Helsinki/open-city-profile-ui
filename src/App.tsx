import React from 'react';
import { Route, Routes } from 'react-router-dom';
import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';
import {
  LoginProvider,
  LoginProviderProps,
  WithAuthentication,
  CookieBanner,
  CookieConsentContextProvider,
} from 'hds-react';
import { ApolloProvider } from '@apollo/client';
import { UserManagerSettings } from 'oidc-client-ts';

import graphqlClient from './graphql/client';
import Login from './auth/components/login/Login';
import OidcCallback from './auth/components/oidcCallback/OidcCallback';
import Profile from './profile/components/profile/Profile';
import { Provider as ProfileProvider } from './profile/context/ProfileContext';
import ProfileDeleted from './profile/components/profileDeleted/ProfileDeleted';
import ErrorPage from './profile/components/errorPage/ErrorPage';
import AboutPage from './aboutPage/AboutPage';
import UserGuide from './userGuide/UserGuide';
import AccessibilityStatement from './accessibilityStatement/AccessibilityStatement';
import GdprAuthorizationCodeManagerCallback from './gdprApi/GdprAuthorizationCodeManagerCallback';
import ToastProvider from './toast/ToastProvider';
import config from './config';
import PageNotFound from './common/pageNotFound/PageNotFound';
import CookieConsentPage from './cookieConsents/CookieConsentPage';
import LoginSSO from './auth/components/loginsso/LoginSSO';
import MatomoTracker from './common/matomo/MatomoTracker';
import { MatomoProvider } from './common/matomo/matomo-context';
import PasswordChangeCallback from './passwordChange/PasswordChangeCallback';
import OtpConfigurationCallback from './otpConfiguration/OtpConfigurationCallback';
import useCookieConsentSettings from './cookieConsents/useCookieConsentSettings';

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

function App(): React.ReactElement {
  const matomoTracker = new MatomoTracker({
    urlBase: window._env_.REACT_APP_MATOMO_URL_BASE,
    siteId: window._env_.REACT_APP_MATOMO_SITE_ID,
    srcUrl: window._env_.REACT_APP_MATOMO_SRC_URL,
    enabled: window._env_.REACT_APP_MATOMO_ENABLED === 'true',
    configurations: {
      setDoNotTrack: true,
    },
  });

  const origin = window.location.origin;

  const userManagerSettings: Partial<UserManagerSettings> = {
    authority: window._env_.REACT_APP_OIDC_AUTHORITY,
    client_id: window._env_.REACT_APP_OIDC_CLIENT_ID,
    redirect_uri: `${origin}/callback`,
    silent_redirect_uri: `${origin}/silent_renew.html`,
    response_type: window._env_.REACT_APP_OIDC_RESPONSE_TYPE,
    scope: window._env_.REACT_APP_OIDC_SCOPE,
    post_logout_redirect_uri: `${origin}/`,
    // This calculates to 1 minute, good for debugging:
    // eslint-disable-next-line max-len
    // https://github.com/City-of-Helsinki/kukkuu-ui/blob/8029ed64c3d0496fa87fa57837c73520e8cbe37f/src/domain/auth/userManager.ts#L18
    // accessTokenExpiringNotificationTimeInSeconds: 3600 - 60,
  };

  const loginProviderProps: LoginProviderProps = {
    userManagerSettings,
    apiTokensClientSettings: {
      url: window._env_.REACT_APP_OIDC_API_TOKENS_URL,
      queryProps: {
        grantType: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        permission: '#access',
      },
      audiences: [window._env_.REACT_APP_PROFILE_AUDIENCE],
    },
    debug: true,
    sessionPollerSettings: { pollIntervalInMs: 60000 },
  };

  const cookieConsentProps = useCookieConsentSettings();

  return (
    <CookieConsentContextProvider {...cookieConsentProps}>
      <LoginProvider {...loginProviderProps}>
        <ApolloProvider client={graphqlClient}>
          <ToastProvider>
            <MatomoProvider value={matomoTracker}>
              <ProfileProvider>
                <CookieBanner />
                <Routes>
                  <Route path="/callback" element={<OidcCallback />} />
                  <Route
                    path="/gdpr-callback"
                    element={<GdprAuthorizationCodeManagerCallback />}
                  />
                  <Route
                    path="/password-change-callback"
                    element={<PasswordChangeCallback />}
                  />
                  <Route
                    path="/otp-configuration-callback"
                    element={<OtpConfigurationCallback />}
                  />
                  <Route
                    path="/delete-credential-callback"
                    element={<OtpConfigurationCallback action="delete" />}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <WithAuthentication
                        AuthorisedComponent={() => <Profile />}
                        UnauthorisedComponent={() => <Login />}
                      />
                    }
                  />

                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/guide" element={<UserGuide />} />
                  <Route
                    path="/accessibility"
                    element={<AccessibilityStatement />}
                  />
                  <Route path="/profile-deleted" element={<ProfileDeleted />} />
                  <Route path={config.errorPagePath} element={<ErrorPage />} />
                  <Route
                    path={config.autoSSOLoginPath}
                    element={<LoginSSO />}
                  />
                  <Route
                    path={config.cookiePagePath}
                    element={<CookieConsentPage />}
                  />

                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </ProfileProvider>
            </MatomoProvider>
          </ToastProvider>
        </ApolloProvider>
      </LoginProvider>
    </CookieConsentContextProvider>
  );
}

export default App;
