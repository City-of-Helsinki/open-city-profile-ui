import { v4 as uuidv4 } from 'uuid';

import {
  ActionExecutor,
  ActionProps,
} from '../../common/actionQueue/actionQueue';

type OidcProps = {
  clientId: string;
  redirectUri: string;
  oidcAuthority: string;
};

const makeAuthorizationUrlParams = (
  clientId: string,
  scopes: string[],
  redirectUri: string,
  state: string
): string => {
  const scope = scopes.join(' ');
  const params = new URLSearchParams();

  params.append('response_type', 'code');
  params.append('client_id', clientId);
  params.append('scope', scope);
  params.append('redirect_uri', redirectUri);
  params.append('state', state);

  return params.toString();
};

const makeAuthorizationUrl = (
  scopes: string[],
  { clientId, redirectUri, oidcAuthority }: OidcProps
): string => {
  const params = makeAuthorizationUrlParams(
    clientId,
    scopes,
    redirectUri,
    uuidv4()
  );

  return `${oidcAuthority}?${params}`;
};

export const keycloakAuthorizationRedirectionExecutor: ActionExecutor = (
  action,
  functions
) => {
  const specs: OidcProps = {
    clientId: 'profile-gdpr-dev',
    redirectUri: `${window.location.origin}/gdpr-callback`,
    oidcAuthority:
      'https://tunnistus.dev.hel.ninja/auth/realms/helsinki-tunnistus/protocol/openid-connect/auth',
  };

  window.location.href = makeAuthorizationUrl(['openid'], specs);

  // gdprAuthCodeManager.fetchAuthorizationCode('download', ['openid', ...scopes]);
  // get code
  return Promise.resolve();
};

const keycloakAuthorizationRedirectionActionType =
  'keycloakAuthorizationRedirection';

export const keycloakAuthorizationRedirectionAction: ActionProps = {
  type: keycloakAuthorizationRedirectionActionType,
  executor: keycloakAuthorizationRedirectionExecutor,
  options: {
    noStorage: true,
  },
};
