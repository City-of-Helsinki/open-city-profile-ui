import { User } from 'oidc-client-ts';
import React from 'react';

import { useAuthenticatedUser } from './LoginContext';

const WithAuthentication = ({
  AuthorisedComponent,
  UnauthorisedComponent,
}: {
  AuthorisedComponent?: React.FC<{ user: User }>;
  UnauthorisedComponent?: React.FC<Record<string, never>>;
}): React.ReactElement | null => {
  const { user, resolving } = useAuthenticatedUser();
  if (resolving) {
    return null;
  }
  if (user && AuthorisedComponent) {
    return <AuthorisedComponent user={user} />;
  }
  if (!user && UnauthorisedComponent) {
    return <UnauthorisedComponent />;
  }
  return null;
};

export default WithAuthentication;
