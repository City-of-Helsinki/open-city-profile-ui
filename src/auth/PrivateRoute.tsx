import React from 'react';
import { Route, RouteProps, Redirect } from 'react-router';
import { useSelector } from 'react-redux';

import { isAuthenticatedSelector } from './redux';

type Props = RouteProps;
function PrivateRoute({ children, ...rest }: Props) {
  const isAuthenticated = useSelector(isAuthenticatedSelector);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

export default PrivateRoute;
