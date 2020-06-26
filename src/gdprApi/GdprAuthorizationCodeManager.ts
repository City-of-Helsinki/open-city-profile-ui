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
    return this.get('authorization_code');
  }

  set code(code: string | null) {
    if (code === null) {
      this.clear('authorization_code');
    } else {
      this.set('authorization_code', code);
    }
  }

  get(key: string) {
    const value = localStorage.getItem(`${PREFIX}.${key}`);

    if (value === null) {
      return null;
    }

    return JSON.parse(value);
  }

  set(key: string, value: object | string) {
    localStorage.setItem(`${PREFIX}.${key}`, JSON.stringify(value));
  }

  clear(key: string) {
    localStorage.removeItem(`${PREFIX}.${key}`);
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
  ) {
    const scope = scopes.join(' ');
    const params = new URLSearchParams();

    params.append('response_type', 'code');
    params.append('client_id', clientId);
    params.append('scope', scope);
    params.append('redirect_uri', redirectUri);
    params.append('state', state);

    return params.toString();
  }

  makeAuthorizationUrl(scopes: string[], state: string) {
    const params = this.makeAuthorizationUrlParams(
      this.config.clientId,
      scopes,
      this.config.redirectUri,
      state
    );

    return `${this.config.oidcAuthority}openid/authorize?${params}`;
  }

  cacheApplicationState(stateId: string, deferredAction: string) {
    this.set(stateId, {
      redirectUrl: window.location.href,
      deferredAction,
    });
  }

  loadApplicationState(stateId: string) {
    const state = this.get(stateId);

    this.clear(stateId);
    window.location.href = `${state.redirectUrl}?a=${state.deferredAction}`;
  }

  fetchAuthorizationCode(deferredAction: string, scopes: string[]) {
    const codeStateId = uuidv4();

    this.cacheApplicationState(codeStateId, deferredAction);

    const authorizationCodeUrl = this.makeAuthorizationUrl(scopes, codeStateId);

    window.location.href = authorizationCodeUrl;
  }

  authorizationCodeFetchCallback() {
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
