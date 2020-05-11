import React from 'react';
import { Switch, Route } from 'react-router';
import { ApolloProvider } from '@apollo/react-hooks';
import { Provider as ReduxProvider } from 'react-redux';
import { OidcProvider, loadUser } from 'redux-oidc';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';

import graphqlClient from './graphql/client';
import store from './redux/store';
import userManager from './auth/userManager';
import enableOidcLogging from './auth/enableOidcLogging';
import Login from './auth/components/login/Login';
import OidcCallback from './auth/components/oidcCallback/OidcCallback';
import Profile from './profile/components/profile/Profile';
import { fetchApiTokenThunk } from './auth/redux';
import ProfileDeleted from './profile/components/profileDeleted/ProfileDeleted';
import AppMeta from './AppMeta';

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

if (process.env.NODE_ENV !== 'production') {
  enableOidcLogging();
}

loadUser(store, userManager).then(async user => {
  if (user && !user.expired) {
    store.dispatch(fetchApiTokenThunk(user.access_token));
  }
});

const instance = createInstance({
  urlBase: 'https://analytics.hel.ninja/',
  siteId: 60,
});

// Prevent non-production data from being submitted to Matomo
// by pretending to require consent to process analytics data and never ask for it.
// https://developer.matomo.org/guides/tracking-javascript-guide#step-1-require-consent
if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
  window._paq.push(['requireConsent']);
}

type Props = {};

function App(props: Props) {
  return (
    <ReduxProvider store={store}>
      <OidcProvider store={store} userManager={userManager}>
        <ApolloProvider client={graphqlClient}>
          <MatomoProvider value={instance}>
            <AppMeta />
            <Switch>
              <Route
                path="/silent_renew"
                render={() => {
                  userManager.signinSilentCallback();
                  return null;
                }}
              />
              <Route path="/callback">
                <OidcCallback />
              </Route>
              <Route path="/login">
                <Login />
              </Route>
              <Route
                path={['/', '/connected-services', '/subscriptions']}
                exact
              >
                <Profile />
              </Route>
              <Route path="/profile-deleted" exact>
                <ProfileDeleted />
              </Route>
              <Route path="*">404 - not found</Route>
            </Switch>
          </MatomoProvider>
        </ApolloProvider>
      </OidcProvider>
    </ReduxProvider>
  );
}

export default App;
