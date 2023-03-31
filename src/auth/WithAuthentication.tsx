import { User } from 'oidc-client-ts';
import React from 'react';

import { useAuthenticatedUser } from './LoginContext';
import { TokenData } from './api-token-client';

const WithAuthentication = ({
  AuthorisedComponent,
  UnauthorisedComponent,
}: {
  AuthorisedComponent?: React.FC<{ user: User; tokens?: TokenData | null }>;
  UnauthorisedComponent?: React.FC<Record<string, never>>;
}): React.ReactElement | null => {
  const { user, resolving, tokens } = useAuthenticatedUser();
  if (resolving) {
    console.log('PENDING');
    return null;
  }
  if (user && AuthorisedComponent) {
    return <AuthorisedComponent user={user} tokens={tokens} />;
  }
  if (!user && UnauthorisedComponent) {
    return <UnauthorisedComponent />;
  }
  return null;
};

export default WithAuthentication;
