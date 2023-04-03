import React from 'react';
import { Switch, Route } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import { MatomoProvider } from '@datapunt/matomo-tracker-react';
import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';

import graphqlClient from './graphql/client';
import Login from './auth/components/login/Login';
import { Provider as LoginProvider } from './auth/LoginContext';
import OidcCallback from './auth/components/oidcCallback/OidcCallback';
import Profile from './profile/components/profile/Profile';
import { Provider as ProfileProvider } from './profile/context/ProfileContext';
import ProfileDeleted from './profile/components/profileDeleted/ProfileDeleted';
import ErrorPage from './profile/components/errorPage/ErrorPage';
import LoginTesterPage from './profile/components/loginTester/LoginTesterPage';
import AccessibilityStatement from './accessibilityStatement/AccessibilityStatement';
import GdprAuthorizationCodeManagerCallback from './gdprApi/GdprAuthorizationCodeManagerCallback';
import ToastProvider from './toast/ToastProvider';
import config from './config';
import PageNotFound from './common/pageNotFound/PageNotFound';
import { useHistoryListener } from './profile/hooks/useHistoryListener';
import WithAuthCheck from './profile/components/withAuthCheck/WithAuthCheck';
import CookieConsentPage from './cookieConsents/CookieConsentPage';
import LoginSSO from './auth/components/loginsso/LoginSSO';
import { useTrackingInstance } from './common/helpers/tracking/matomoTracking';
import { LoginClientProps } from './auth/login-client';
import LoginCallbackRoute from './auth/LoginCallbackRoute';

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

const loginProps: LoginClientProps = {
  userManagerSettings: {
    authority: window._env_.REACT_APP_OIDC_AUTHORITY,
    client_id: window._env_.REACT_APP_OIDC_CLIENT_ID,
    response_type: window._env_.REACT_APP_OIDC_RESPONSE_TYPE,
    scope: window._env_.REACT_APP_OIDC_SCOPE,
  },
  apiTokenUrl: `${window._env_.REACT_APP_OIDC_AUTHORITY}api-tokens/`,
  sessionPollingIntervalInMs: 60000,
};

function App(): React.ReactElement {
  useHistoryListener();
  const instance = useTrackingInstance();
  return (
    <ApolloProvider client={graphqlClient}>
      <ToastProvider>
        <MatomoProvider value={instance}>
          <LoginProvider loginProps={loginProps}>
            <ProfileProvider>
              <Switch>
                <Route path="/callbackOLD" component={OidcCallback} />
                <Route path="/gdpr-callback">
                  <GdprAuthorizationCodeManagerCallback />
                </Route>
                <Route path="/login">
                  <Login />
                </Route>
                <Route path={['/old', '/connected-services']} exact>
                  <WithAuthCheck
                    AuthenticatedComponent={Profile}
                  ></WithAuthCheck>
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
                <Route path={'/'} exact>
                  <LoginTesterPage />
                </Route>
                <Route path={'/callback'} exact>
                  <LoginCallbackRoute />
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
