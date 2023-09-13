import { v4 as uuidv4 } from 'uuid';

const PREFIX = 'kuvaGdprAuthManager';

interface GdprAuthorizationCodeManagerConfig {
  clientId: string;
  redirectUri: string;
  oidcAuthority: string;
}

class GdprAuthorizationCodeManager {
  config: GdprAuthorizationCodeManagerConfig;

  constructor(config: GdprAuthorizationCodeManagerConfig) {
    this.config = config;
  }

  get code(): string | null {
    const code = this.get('authorization_code');
    return code ? (code as string) : null;
  }

  set code(code: string | null) {
    if (code === null) {
      this.clear('authorization_code');
    } else {
      this.set('authorization_code', code);
    }
  }

  get(key: string): Record<string, unknown> | string | null {
    const value = sessionStorage.getItem(`${PREFIX}.${key}`);

    if (value === null) {
      return null;
    }

    return JSON.parse(value);
  }

  set(key: string, value: Record<string, unknown> | string): void {
    sessionStorage.setItem(`${PREFIX}.${key}`, JSON.stringify(value));
  }

  clear(key: string): void {
    sessionStorage.removeItem(`${PREFIX}.${key}`);
  }

  consumeCode(): string {
    const code = this.code;

    if (!code) {
      throw Error('There was no code to consume');
    }

    this.code = null;

    return code;
  }

  makeAuthorizationUrlParams(
    clientId: string,
    scopes: string[],
    redirectUri: string,
    state: string
  ): string {
    const scope = scopes.join(' ');
    const params = new URLSearchParams();

    params.append('response_type', 'code');
    params.append('client_id', clientId);
    params.append('scope', scope);
    params.append('redirect_uri', redirectUri);
    params.append('state', state);

    return params.toString();
  }

  makeAuthorizationUrl(idp: string, scopes: string[], state: string): string {
    if (idp == 'keycloak') {
      const params = this.makeAuthorizationUrlParams(
        'profile-gdpr-local',
        ['openid'],
        this.config.redirectUri,
        state
      );
      // return `http://localhost:9080/auth/realms/helsinki-tunnistus/protocol/openid-connect/auth?${params}`;
      return `http://keycloak.localhost:9080/auth/realms/helsinki-tunnistus/protocol/openid-connect/auth?${params}`;
    } else {
      const params = this.makeAuthorizationUrlParams(
        this.config.clientId,
        scopes,
        this.config.redirectUri,
        state
      );
      return `${this.config.oidcAuthority}openid/authorize?${params}`;
    }
  }

  cacheApplicationState(stateId: string, deferredAction: string): void {
    this.set(stateId, {
      redirectUrl: window.location.href,
      deferredAction,
    });
  }

  loadApplicationState(stateId: string): void {
    const state = this.get(stateId) as Record<string, unknown>;

    this.clear(stateId);
    window.location.href = `${state.redirectUrl}?a=${state.deferredAction}`;
  }

  fetchAuthorizationCode(
    idp: string,
    deferredAction: string,
    scopes: string[]
  ): void {
    const codeStateId = uuidv4();

    this.cacheApplicationState(codeStateId, deferredAction);

    const authorizationCodeUrl = this.makeAuthorizationUrl(
      idp,
      scopes,
      codeStateId
    );

    window.location.href = authorizationCodeUrl;
  }

  authorizationCodeFetchCallback(): void {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (state) {
      this.loadApplicationState(state);
    }

    this.code = code;
  }
}

export default GdprAuthorizationCodeManager;
