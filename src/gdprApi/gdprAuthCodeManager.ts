import GdprAuthorizationTokenManager from './GdprAuthorizationCodeManager';

const gdprAuthCodeManager = new GdprAuthorizationTokenManager({
  clientId: process.env.REACT_APP_PROFILE_AUDIENCE as string,
  redirectUri: `${window.location.origin}/gdpr-callback`,
  oidcAuthority: window._env_.REACT_APP_OIDC_AUTHORITY as string,
});

export default gdprAuthCodeManager;
