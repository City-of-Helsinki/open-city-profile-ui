import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import { MatomoProvider } from '@datapunt/matomo-tracker-react';
import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';
import {
  LoginProvider,
  LoginProviderProps,
  WithAuthentication,
} from 'hds-react';
import { useTranslation } from 'react-i18next';

import graphqlClient from './graphql/client';
import Login from './auth/components/login/Login';
import OidcCallback from './auth/components/oidcCallback/OidcCallback';
import Profile from './profile/components/profile/Profile';
import { Provider as ProfileProvider } from './profile/context/ProfileContext';
import ProfileDeleted from './profile/components/profileDeleted/ProfileDeleted';
import ErrorPage from './profile/components/errorPage/ErrorPage';
import AccessibilityStatement from './accessibilityStatement/AccessibilityStatement';
import GdprAuthorizationCodeManagerCallback from './gdprApi/GdprAuthorizationCodeManagerCallback';
import ToastProvider from './toast/ToastProvider';
import config from './config';
import PageNotFound from './common/pageNotFound/PageNotFound';
import {
  getLinkRedirectState,
  useHistoryListener,
} from './profile/hooks/useHistoryListener';
import CookieConsentPage from './cookieConsents/CookieConsentPage';
import LoginSSO from './auth/components/loginsso/LoginSSO';
import { useTrackingInstance } from './common/helpers/tracking/matomoTracking';
import Loading from './common/loading/Loading';
import PageLayout from './common/pageLayout/PageLayout';

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

const loginProviderProps: LoginProviderProps = {
  userManagerSettings: {
    authority: window._env_.REACT_APP_OIDC_AUTHORITY,
    client_id: window._env_.REACT_APP_OIDC_CLIENT_ID,
    scope: window._env_.REACT_APP_OIDC_SCOPE,
    redirect_uri: `${origin}/callback`,
    silent_redirect_uri: `${origin}/silent_renew.html`,
  },
  apiTokensClientSettings: {
    url: 'https://tunnistamo.dev.hel.ninja/api-tokens/',
  },
  sessionPollerSettings: { pollIntervalInMs: 10000 },
};

const RedirectUnAuthenticatedUser = () => {
  const history = useHistory();
  const { t } = useTranslation();
  useEffect(() => {
    history.push('/login', getLinkRedirectState());
  }, [history]);
  return (
    <PageLayout title={t('appName')} disableFocusing>
      <Loading isLoading loadingText={t('loading')} />
    </PageLayout>
  );
};

function App(): React.ReactElement {
  useHistoryListener();
  const instance = useTrackingInstance();
  return (
    <ApolloProvider client={graphqlClient}>
      <ToastProvider>
        <MatomoProvider value={instance}>
          <LoginProvider {...loginProviderProps}>
            <ProfileProvider>
              <Switch>
                <Route path="/callback" component={OidcCallback} />
                <Route path="/gdpr-callback">
                  <GdprAuthorizationCodeManagerCallback />
                </Route>
                <Route path="/login">
                  <Login />
                </Route>
                <Route path={['/', '/connected-services']} exact>
                  <WithAuthentication
                    AuthorisedComponent={Profile}
                    UnauthorisedComponent={RedirectUnAuthenticatedUser}
                  ></WithAuthentication>
                </Route>
                <Route path="/accessibility" exact>
                  <AccessibilityStatement />
                </Route>
                <Route path="/profile-deleted" exact>
                  <ProfileDeleted />
                </Route>
                <Route path={config.errorPagePath} exact>
                  <ErrorPage />
                </Route>
                <Route path={config.autoSSOLoginPath} exact>
                  <LoginSSO />
                </Route>
                <Route path={config.cookiePagePath} exact>
                  <CookieConsentPage />
                </Route>
                <Route path="*">
                  <PageNotFound />
                </Route>
              </Switch>
            </ProfileProvider>
          </LoginProvider>
        </MatomoProvider>
      </ToastProvider>
    </ApolloProvider>
  );
}

export default App;
