import defaultTo from 'lodash/defaultTo';

const config = {
  clientId: window._env_.REACT_APP_OIDC_CLIENT_ID,
  environment: window._env_.REACT_APP_ENVIRONMENT,
  helsinkiAccountAMR: defaultTo(
    window._env_.REACT_APP_HELSINKI_ACCOUNT_AMR,
    'helsinki_tunnus'
  ),
  oidcAuthority: window._env_.REACT_APP_OIDC_AUTHORITY,
  keycloakGdprClientId: window._env_.REACT_APP_KEYCLOAK_GDPR_CLIENT_ID,
  keycloakAuthority: window._env_.REACT_APP_KEYCLOAK_AUTHORITY,
  mfa: window._env_.REACT_APP_MFA_ENABLED === 'true',
  errorPagePath: '/error',
  cookiePagePath: '/cookies',
  autoSSOLoginPath: '/loginsso',
  gdprCallbackPath: '/gdpr-callback',
  downloadPath: '/',
  deletePath: '/',
  serviceConnectionsPath: '/connected-services',
};

export default config;
