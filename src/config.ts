import defaultTo from 'lodash/defaultTo';

const config = {
  clientId: window._env_.REACT_APP_OIDC_CLIENT_ID,
  environment: window._env_.REACT_APP_ENVIRONMENT,
  helsinkiAccountAMR: defaultTo(
    window._env_.REACT_APP_HELSINKI_ACCOUNT_AMR,
    'helusername'
  ),
  oidcAuthority: window._env_.REACT_APP_OIDC_AUTHORITY,
  identityProviderManagementUrlHelsinki: defaultTo(
    window._env_.REACT_APP_IPD_MANAGEMENT_URL_HELSINKI_ACCOUNT,
    'https://salasana.hel.ninja/auth/realms/helsinki-salasana/account'
  ),
  identityProviderManagementUrlGithub: defaultTo(
    window._env_.REACT_APP_IPD_MANAGEMENT_URL_GITHUB,
    'https://github.com/settings/profile'
  ),
  identityProviderManagementUrlGoogle: defaultTo(
    window._env_.REACT_APP_IPD_MANAGEMENT_URL_GOOGLE,
    'https://myaccount.google.com'
  ),
  identityProviderManagementUrlFacebook: defaultTo(
    window._env_.REACT_APP_IPD_MANAGEMENT_URL_FACEBOOK,
    'http://facebook.com/settings'
  ),
  identityProviderManagementUrlYle: defaultTo(
    window._env_.REACT_APP_IPD_MANAGEMENT_URL_YLE,
    'https://tunnus.yle.fi/#omat-tiedot'
  ),
  identityProviderManagementUrlTunnistusSuomifi: defaultTo(
    window._env_.REACT_APP_IPD_MANAGEMENT_URL_TUNNISTUS_SUOMI_FI,
    'https://suomi.fi'
  ),
  errorPagePath: '/error',
};

export default config;
