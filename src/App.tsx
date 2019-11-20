import React from 'react';
import { Switch, Route } from 'react-router';
import { ApolloProvider } from '@apollo/react-hooks';
import { Provider as ReduxProvider } from 'react-redux';
import { OidcProvider, loadUser } from 'redux-oidc';

import graphqlClient from './graphql/client';
import store from './redux/store';
import userManager from './auth/userManager';
import enableOidcLogging from './auth/enableOidcLogging';
import Home from './pages/Home';
import OidcCallback from './pages/OidcCallback';
import Profile from './pages/Profile';
import { fetchApiTokenThunk } from './auth/redux';
import PrivateRoute from './auth/PrivateRoute';

if (process.env.NODE_ENV !== 'production') {
  enableOidcLogging();
}

loadUser(store, userManager).then(async user => {
  if (user && !user.expired) {
    store.dispatch(fetchApiTokenThunk(user.access_token));
  }
});

type Props = {};

function App(props: Props) {
  return (
    <ReduxProvider store={store}>
      <OidcProvider store={store} userManager={userManager}>
        <ApolloProvider client={graphqlClient}>
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
            <PrivateRoute path="/profile">
              <Profile />
            </PrivateRoute>
            <Route path="/" exact>
              <Home />
            </Route>
          </Switch>
        </ApolloProvider>
      </OidcProvider>
    </ReduxProvider>
  );
}

export default App;
