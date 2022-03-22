import React from 'react';
import { useLocation } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';

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
import authService from './auth/authService';
import config from './config';
import PageNotFound from './common/pageNotFound/PageNotFound';
import { useHistoryListener } from './profile/hooks/useHistoryListener';

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

const instance = createInstance({
  urlBase: 'https://analytics.hel.ninja/',
  siteId: 60,
});

// Prevent non-production data from being submitted to Matomo
// by pretending to require consent to process analytics data and never ask for it.
// https://developer.matomo.org/guides/tracking-javascript-guide#step-1-require-consent
if (window._env_.REACT_APP_ENVIRONMENT !== 'production') {
  window._paq.push(['requireConsent']);
}

function App(): React.ReactElement {
  const location = useLocation();

  if (location.pathname === '/loginsso') {
    authService.login();
  }

  useHistoryListener();

  return (
    <ApolloProvider client={graphqlClient}>
      <ToastProvider>
        <MatomoProvider value={instance}>
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
                <Profile />
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
              <Route path="/loginsso" exact />
              <Route path="*">
                <PageNotFound />
              </Route>
            </Switch>
          </ProfileProvider>
        </MatomoProvider>
      </ToastProvider>
    </ApolloProvider>
  );
}

export default App;
