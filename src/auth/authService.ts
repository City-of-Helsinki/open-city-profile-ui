import {
  UserManager,
  User,
  UserManagerSettings,
  Log,
  WebStorageStateStore,
} from 'oidc-client';
import * as Sentry from '@sentry/browser';
import HttpStatusCode from 'http-status-typed';
import i18n from 'i18next';
import to from 'await-to-js';

import pickProfileApiToken from './pickProfileApiToken';
import createHttpPoller, { HttpPoller } from './http-poller';

const origin = window.location.origin;
export const API_TOKEN = 'apiToken';

function isUserExpired(user?: Partial<User> | null): boolean {
  if (!user) {
    return true;
  }
  if (user.expired !== undefined) {
    return user.expired;
  }
  const expiresAtInSeconds = user.expires_at;

  if (expiresAtInSeconds) {
    return expiresAtInSeconds - Date.now() / 1000 <= 0;
  }
  return true;
}

export class AuthService {
  userManager: UserManager;
  userSessionValidityPoller: HttpPoller;
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
      headers.append('authorization', `Bearer ${accessToken}`);

      return fetch(uri, {
        method: 'GET',
        headers,
      });
    };

    this.userSessionValidityPoller = createHttpPoller({
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

    this.userManager.events.addUserSignedOut(async () => {
      await this.cleanUpUserSessionAndApiTokens();
    });

    // This is called by userManager while processing endLogin()
    // and when silent renew is complete
    // endLogin() also calls fetchApiToken. Multiple calls are prevented with _isProcessingLogin
    this.userManager.events.addUserLoaded(async user => {
      if (!this._isProcessingLogin && this.isAuthenticatedUser(user)) {
        await this.fetchApiToken(user);
      }
      return Promise.resolve();
    });

    this.userManager.events.addUserUnloaded(async () => {
      await this.cleanUpUserSessionAndApiTokens();
    });
  }

  public getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }

  // It is assumed that user and api tokens are removed hand in hand.
  // If user tokens exists, api tokens must also exist.
  // That is why api tokens are not checked here.
  public async getAuthenticatedUser(): Promise<User | null> {
    const user = await this.getUser();
    if (!this.isAuthenticatedUser(user)) {
      return Promise.reject(null);
    }
    this.userSessionValidityPoller.start();
    return Promise.resolve(user);
  }

  public getToken(): string | null {
    return sessionStorage.getItem(API_TOKEN);
  }

  public isAuthenticatedUser(user?: User | null): boolean {
    return !!user && !isUserExpired(user) && !!user.access_token;
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
    await this.userManager
      .signinRedirect({ data: { path }, ui_locales: i18n.language })
      .catch(error => {
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
    const apiTokenSuccess = await this.fetchApiToken(user);
    if (!apiTokenSuccess) {
      await this.userManager.removeUser();
      return Promise.reject(
        new Error('Api token error - no valid api token returned')
      );
    }
    this._isProcessingLogin = false;
    this.userSessionValidityPoller.start();
    return user;
  }

  public renewToken(): Promise<User> {
    return this.userManager.signinSilent();
  }

  public async logout(): Promise<void> {
    await this.userManager.signoutRedirect({
      extraQueryParams: { ui_locales: i18n.language },
    });
  }

  async fetchApiToken(user: User): Promise<boolean> {
    const url = `${window._env_.REACT_APP_OIDC_AUTHORITY}api-tokens/`;
    const [, response] = await to(
      fetch(url, {
        headers: {
          authorization: `bearer ${user.access_token}`,
        },
      })
    );
    if (!response) {
      return Promise.resolve(false);
    }
    const result = await response.json();
    const apiToken = pickProfileApiToken(result);
    sessionStorage.setItem(API_TOKEN, apiToken);
    return Promise.resolve(!!apiToken);
  }

  async cleanUpUserSessionAndApiTokens(): Promise<void> {
    await this.userManager.clearStaleState();
    sessionStorage.removeItem(API_TOKEN);
    this.userSessionValidityPoller.stop();
  }
}

export default new AuthService();
