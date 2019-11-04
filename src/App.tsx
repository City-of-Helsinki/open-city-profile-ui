import React from 'react';
import { Switch, Route } from 'react-router';
import { Provider as ReduxProvider } from 'react-redux';
import { OidcProvider, loadUser } from 'redux-oidc';

import store from './redux/store';
import userManager from './auth/userManager';
import enableOidcLogging from './auth/enableOidcLogging';
import Home from './pages/Home';
import OidcCallback from './pages/OidcCallback';
import { fetchApiTokenThunk } from './auth/redux';

if (process.env.NODE_ENV !== 'production') {
  enableOidcLogging();
}

loadUser(store, userManager).then(async user => {
  if (user) {
    store.dispatch(fetchApiTokenThunk(user.access_token));
  }
});

type Props = {};

function App(props: Props) {
  return (
    <ReduxProvider store={store}>
      <OidcProvider store={store} userManager={userManager}>
        <Switch>
          <Route
            path="/silent_renew"
            render={() => {
              userManager.signinSilentCallback();
              return null;
            }}
          />
          <Route path="/callback" component={OidcCallback} />
          <Route path="/" component={Home} exact />
        </Switch>
      </OidcProvider>
    </ReduxProvider>
  );
}

export default App;
