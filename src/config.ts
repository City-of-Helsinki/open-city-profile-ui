import defaultTo from 'lodash/defaultTo';

export default {
  clientId: process.env.REACT_APP_OIDC_CLIENT_ID,
  environment: process.env.REACT_APP_ENVIRONMENT,
  helsinkiAccountAMR: defaultTo(
    process.env.REACT_APP_HELSINKI_ACCOUNT_AMR,
    'helusername'
  ),
  oidcAuthority: process.env.REACT_APP_OIDC_AUTHORITY,
  oidcScope: process.env.REACT_APP_OIDC_SCOPE,
  profileAudience: process.env.REACT_APP_PROFILE_AUDIENCE,
  profileGraphQl: process.env.REACT_APP_PROFILE_GRAPHQL,
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  identityProviderManagementUrlHelsinki: defaultTo(
    process.env.REACT_APP_IPD_MANAGEMENT_URL_HELSINKI_ACCOUNT,
    'https://salasana.hel.ninja/auth/realms/helsinki-salasana/account'
  ),
  identityProviderManagementUrlGithub: defaultTo(
    process.env.REACT_APP_IPD_MANAGEMENT_URL_GITHUB,
    'https://github.com/settings/profile'
  ),
  identityProviderManagementUrlGoogle: defaultTo(
    process.env.REACT_APP_IPD_MANAGEMENT_URL_GOOGLE,
    'https://myaccount.google.com'
  ),
  identityProviderManagementUrlFacebook: defaultTo(
    process.env.REACT_APP_IPD_MANAGEMENT_URL_FACEBOOK,
    'http://facebook.com/settings'
  ),
  identityProviderManagementUrlYle: defaultTo(
    process.env.REACT_APP_IPD_MANAGEMENT_URL_YLE,
    'https://tunnus.yle.fi/#omat-tiedot'
  ),
};
