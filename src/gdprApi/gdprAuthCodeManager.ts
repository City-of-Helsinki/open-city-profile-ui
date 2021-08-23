import GdprAuthorizationTokenManager from './GdprAuthorizationCodeManager';

const gdprAuthCodeManager = new GdprAuthorizationTokenManager({
  clientId: window._env_.REACT_APP_PROFILE_BE_GDPR_CLIENT_ID as string,
  redirectUri: `${window.location.origin}/gdpr-callback`,
  oidcAuthority: window._env_.REACT_APP_OIDC_AUTHORITY as string,
});

export default gdprAuthCodeManager;
