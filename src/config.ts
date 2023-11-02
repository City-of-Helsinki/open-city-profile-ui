import defaultTo from 'lodash/defaultTo';

const config = {
  clientId: window._env_.REACT_APP_OIDC_CLIENT_ID,
  environment: window._env_.REACT_APP_ENVIRONMENT,
  helsinkiAccountAMR: defaultTo(
    window._env_.REACT_APP_HELSINKI_ACCOUNT_AMR,
    'helusername'
  ),
  oidcAuthority: window._env_.REACT_APP_OIDC_AUTHORITY,
  profileAudience: window._env_.REACT_APP_PROFILE_AUDIENCE,
  errorPagePath: '/error',
  cookiePagePath: '/cookies',
  autoSSOLoginPath: '/loginsso',
};

export default config;
