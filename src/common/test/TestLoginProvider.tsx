import React from 'react';
import { LoginProvider, LoginProviderProps } from 'hds-react';

const settings = {
  automaticSilentRenew: true,
  validateSubOnSilentRenew: false,
  includeIdTokenInSilentRenew: false,
  monitorSession: true,
  filterProtocolClaims: false,
  authority: window._env_.REACT_APP_OIDC_AUTHORITY,
  client_id: window._env_.REACT_APP_OIDC_CLIENT_ID,
  redirect_uri: `${origin}/callback`,
  silent_redirect_uri: `${origin}/silent_renew.html`,
  response_type: window._env_.REACT_APP_OIDC_RESPONSE_TYPE,
  scope: window._env_.REACT_APP_OIDC_SCOPE,
  post_logout_redirect_uri: `${origin}/`,
};

const providerProperties: LoginProviderProps = {
  userManagerSettings: settings,
  apiTokensClientSettings: {
    url: `${window._env_.REACT_APP_OIDC_AUTHORITY}api-tokens/`,
  },
  debug: true,
  sessionPollerSettings: { pollIntervalInMs: 300000 },
};

const TestLoginProvider: React.FC = ({ children }) => (
  <LoginProvider {...providerProperties}>{children}</LoginProvider>
);

export default TestLoginProvider;
