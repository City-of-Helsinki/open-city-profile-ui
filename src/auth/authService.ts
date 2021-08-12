import {
  UserManager,
  User,
  UserManagerSettings,
  Log,
  WebStorageStateStore,
} from 'oidc-client';
import * as Sentry from '@sentry/browser';
import HttpStatusCode from 'http-status-typed';

import pickProfileApiToken from './pickProfileApiToken';
import createHttpPoller from './http-poller';

const origin = window.location.origin;
export const API_TOKEN = 'apiToken';

export class AuthService {
  userManager: UserManager;
  private _isProcessingLogin = false;
  constructor() {
    const settings: UserManagerSettings = {
      automaticSilentRenew: true,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      authority: window._env_.REACT_APP_OIDC_AUTHORITY,
      client_id: window._env_.REACT_APP_OIDC_CLIENT_ID,
      redirect_uri: `${origin}/callback`,
      silent_redirect_uri: `${origin}/silent_renew.html`,
      response_type: window._env_.REACT_APP_OIDC_RESPONSE_TYPE,
      scope: window._env_.REACT_APP_OIDC_SCOPE,
      post_logout_redirect_uri: `${origin}/`,
      // This calculates to 1 minute, good for debugging:
      // eslint-disable-next-line max-len
      // https://github.com/City-of-Helsinki/kukkuu-ui/blob/8029ed64c3d0496fa87fa57837c73520e8cbe37f/src/domain/auth/userManager.ts#L18
      // accessTokenExpiringNotificationTime: 59.65 * 60,
    };

    // Show oidc debugging info in the console only while developing
    if (window._env_.NODE_ENV === 'development') {
      Log.logger = console;
      Log.level = Log.INFO;
    }

    // User Manager instance
    this.userManager = new UserManager(settings);

    // Public methods
    this.getUser = this.getUser.bind(this);
    this.getToken = this.getToken.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.login = this.login.bind(this);
    this.endLogin = this.endLogin.bind(this);
    this.renewToken = this.renewToken.bind(this);
    this.logout = this.logout.bind(this);

    const userInfoFetchFunction = async (): Promise<Response | undefined> => {
      const uri = await this.userManager.metadataService.getUserInfoEndpoint();
      const user = await this.getUser();
      const accessToken = user && user.access_token;
      if (!accessToken) {
        return Promise.reject(new Error('Access token not set'));
      }
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${accessToken}`);

      return fetch(uri, {
        method: 'GET',
        headers,
      });
    };

    const userSessionValidityPoller = createHttpPoller({
      pollFunction: userInfoFetchFunction,
      shouldPoll: () => this.isAuthenticated(),
      onError: returnedHttpStatus => {
        if (
          this.isAuthenticated() &&
          returnedHttpStatus &&
          (returnedHttpStatus === HttpStatusCode.FORBIDDEN ||
            returnedHttpStatus === HttpStatusCode.UNAUTHORIZED)
        ) {
          this.logout();
          return { keepPolling: false };
        }
        return { keepPolling: this.isAuthenticated() };
      },
    });

    // Events
    this.userManager.events.addAccessTokenExpired(() => {
      this.logout();
    });

    this.userManager.events.addUserSignedOut(() => {
      this.userManager.clearStaleState();
      sessionStorage.removeItem(API_TOKEN);
      userSessionValidityPoller.stop();
    });

    this.userManager.events.addUserLoaded(async user => {
      if (!this._isProcessingLogin && this.isAuthenticatedUser(user)) {
        this.fetchApiToken(user);
      }
      userSessionValidityPoller.start();
    });

    this.userManager.events.addUserUnloaded(() => {
      userSessionValidityPoller.stop();
    });
  }

  public getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }

  public getToken(): string | null {
    return sessionStorage.getItem(API_TOKEN);
  }

  public isAuthenticatedUser(user?: User | null): boolean {
    return !!user && user.expired !== true && !!user.access_token;
  }

  public isAuthenticated(): boolean {
    const userKey = `oidc.user:${window._env_.REACT_APP_OIDC_AUTHORITY}:${window._env_.REACT_APP_OIDC_CLIENT_ID}`;
    const oidcStorage = sessionStorage.getItem(userKey);
    const apiTokens = this.getToken();
    const parsedUser = oidcStorage && JSON.parse(oidcStorage);
    return this.isAuthenticatedUser(parsedUser) && !!apiTokens;
  }

  public async login(path = '/'): Promise<void> {
    let success = true;
    await this.userManager.signinRedirect({ data: { path } }).catch(error => {
      success = false;
      if (error.message !== 'Network Error') {
        Sentry.captureException(error);
      }
    });
    return success ? Promise.resolve() : Promise.reject();
  }

  public async endLogin(): Promise<User> {
    this._isProcessingLogin = true;
    const user = await this.userManager.signinRedirectCallback();
    if (!this.isAuthenticatedUser(user)) {
      return Promise.reject(new Error('Login failed - no valid user returned'));
    }
    await this.fetchApiToken(user);
    this._isProcessingLogin = false;
    return user;
  }

  public renewToken(): Promise<User> {
    return this.userManager.signinSilent();
  }

  public async logout(): Promise<void> {
    sessionStorage.removeItem(API_TOKEN);
    this.userManager.clearStaleState();
    await this.userManager.signoutRedirect();
  }

  async fetchApiToken(user: User): Promise<void> {
    const url = `${window._env_.REACT_APP_OIDC_AUTHORITY}api-tokens/`;
    const response = await fetch(url, {
      headers: {
        Authorization: `bearer ${user.access_token}`,
      },
    });
    const result = await response.json();
    const apiToken = pickProfileApiToken(result);

    sessionStorage.setItem(API_TOKEN, apiToken);
  }
}

export default new AuthService();
