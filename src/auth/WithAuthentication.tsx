import { User } from 'oidc-client-ts';
import React from 'react';

import { useAuthenticatedUser } from './LoginContext';
import { TokenData } from './api-token-client';
import LoginClientError from './login-client-error';

const WithAuthentication = ({
  AuthorisedComponent,
  UnauthorisedComponent,
}: {
  AuthorisedComponent?: React.FC<{ user: User; tokens?: TokenData | null }>;
  UnauthorisedComponent?: React.FC<{ error?: LoginClientError }>;
}): React.ReactElement | null => {
  const { user, resolving, tokens, error } = useAuthenticatedUser();
  if (resolving) {
    return null;
  }
  if (user && AuthorisedComponent) {
    return <AuthorisedComponent user={user} tokens={tokens} />;
  }
  if (!user && UnauthorisedComponent) {
    return <UnauthorisedComponent error={error} />;
  }
  return null;
};

export default WithAuthentication;
