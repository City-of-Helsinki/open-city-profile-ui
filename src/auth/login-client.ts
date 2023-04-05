import {
  UserManager,
  UserManagerSettings,
  Log,
  SigninRedirectArgs,
  WebStorageStateStore,
  User,
  SignoutRedirectArgs,
} from 'oidc-client-ts';
import to from 'await-to-js';

import createApiTokenClient, { TokenData } from './api-token-client';
import createUserSessionPoller, {
  UserSessionPoller,
} from './user-session-poller';

export type LoginProps = {
  language?: string;
} & SigninRedirectArgs;

export type LogoutProps = {
  language?: string;
} & SignoutRedirectArgs;

export type UserReturnType = User | null;

export type LoginClientProps = {
  userManagerSettings: Partial<UserManagerSettings>;
  defaultPollIntervalInMs?: number;
  logLevel?: Log;
  logger?: Parameters<typeof Log.setLogger>[0];
  apiTokenUrl?: string;
  apiTokenMaxRetries?: number;
  apiTokenRetryIntervalInMs?: number;
  sessionPollingIntervalInMs?: number;
  removeUserWithoutTokens?: boolean;
};

export type LoginClient = {
  login: (props?: LoginProps) => Promise<void>;
  logout: (props?: LogoutProps) => Promise<void>;
  handleCallback: () => Promise<User>;
  isAuthenticated: (user?: UserReturnType) => boolean;
  getUser: () => UserReturnType;
  getTokens: () => TokenData | null;
  getUserAndFetchTokens: () => Promise<
    [UserReturnType, TokenData | null, Error | undefined]
  >;
  getStoredUserAndTokens: () => [
    UserReturnType | undefined,
    TokenData | null | undefined
  ];
  cleanUp: () => Promise<void>;
};

const getDefaultProps = (baseUrl: string): Partial<LoginClientProps> => ({
  defaultPollIntervalInMs: 60000,
  logger: console,
  removeUserWithoutTokens: true,
  userManagerSettings: {
    automaticSilentRenew: true,
    redirect_uri: `${baseUrl}/callback`,
    silent_redirect_uri: `${baseUrl}/silent_renew.html`,
    response_type: 'code',
    post_logout_redirect_uri: `${baseUrl}/`,
    monitorSession: true,
    includeIdTokenInSilentRenew: true,
    validateSubOnSilentRenew: false,
    loadUserInfo: true,
  } as UserManagerSettings,
});

export default function createLoginClient(
  props: LoginClientProps
): LoginClient {
  const {
    userManagerSettings: userManagerSettingsFromProps,
    ...restProps
  } = props;

  const {
    userManagerSettings: defaultUserManagerSettings,
    ...restDefaultProps
  } = getDefaultProps(window.location.origin);

  const store = window.sessionStorage;
  const combinedProps: LoginClientProps = {
    ...restDefaultProps,
    ...restProps,
    userManagerSettings: {
      ...defaultUserManagerSettings,
      ...userManagerSettingsFromProps,
      userStore: new WebStorageStateStore({ store }),
    },
  };
  const userManager = new UserManager(
    combinedProps.userManagerSettings as UserManagerSettings
  );
  let sessionPoller: UserSessionPoller;

  const {
    sessionPollingIntervalInMs,
    apiTokenUrl,
    apiTokenMaxRetries,
    apiTokenRetryIntervalInMs,
    removeUserWithoutTokens,
  } = combinedProps;

  const apiTokenClient = apiTokenUrl
    ? createApiTokenClient({
        url: apiTokenUrl,
        maxRetries: apiTokenMaxRetries,
        retryInterval: apiTokenRetryIntervalInMs,
      })
    : undefined;
  const shouldGetApiTokens = !!apiTokenClient;
  let _isProcessingLogin = false;

  const startSessionPollingIfRequired = () => {
    if (!sessionPollingIntervalInMs) {
      return;
    }
    if (!sessionPoller) {
      sessionPoller = createUserSessionPoller({
        userManager,
        pollIntervalInMs: sessionPollingIntervalInMs,
        shouldPoll: () => true,
        onError: () => false,
      });
    }
    sessionPoller.start();
  };

  const stopSessionPolling = () => {
    if (sessionPoller) {
      sessionPoller.stop();
    }
  };

  const isUserExpired = (user?: Partial<User> | null): boolean => {
    if (!user) {
      return true;
    }
    if (user.expired !== undefined) {
      // does not detect
      return user.expired;
    }
    const expiresAtInSeconds = user.expires_at;
    if (expiresAtInSeconds) {
      return expiresAtInSeconds - Date.now() / 1000 <= 0;
    }
    return true;
  };

  const getUserStoreKey = (): string =>
    // "oidc" is the default prefix passed
    // "user" is the userStoreKey
    `oidc.user:${combinedProps.userManagerSettings.authority}:${combinedProps.userManagerSettings.client_id}`;

  const getUserFromStorageSyncronously = (): UserReturnType => {
    const userData = store.getItem(getUserStoreKey());
    if (!userData) {
      return null;
    }
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  };

  const isValidUser = (user?: User | null): boolean =>
    !!user && !isUserExpired(user) && !!user.access_token;

  // This is called by userManager while processing endLogin()
  // and when silent renew is complete
  // endLogin() also calls fetchApiToken. Multiple calls are prevented with _isProcessingLogin
  userManager.events.addUserLoaded(async user => {
    startSessionPollingIfRequired();
    if (!_isProcessingLogin && shouldGetApiTokens) {
      const [fetchError, tokens] = await to(apiTokenClient.fetch(user));
      if (fetchError) {
        //....
      }
    }
  });

  userManager.events.addUserUnloaded(() => {
    if (apiTokenClient) {
      apiTokenClient.clear();
    }
    stopSessionPolling();
  });

  const removeUser = async () => {
    await userManager.clearStaleState();
    await userManager.removeUser();
  };

  const removeApiTokens = () => {
    if (apiTokenClient) {
      apiTokenClient.clear();
    }
  };

  const validateUserAndClearIfInvalid = async (
    user?: UserReturnType
  ): Promise<boolean> => {
    if (!isValidUser(user)) {
      if (user) {
        await removeUser();
        removeApiTokens();
      }
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  };

  if (isValidUser(getUserFromStorageSyncronously())) {
    startSessionPollingIfRequired();
  }

  return {
    login: async loginProps => {
      const { extraQueryParams = {}, language, ...rest } = loginProps || {};
      if (language) {
        extraQueryParams.ui_locales = language;
      }
      return userManager.signinRedirect({
        extraQueryParams,
        ...rest,
      });
    },
    handleCallback: async () => {
      _isProcessingLogin = true;
      const user = await userManager.signinRedirectCallback();
      if (!isValidUser(user)) {
        return Promise.reject(
          new Error('Login failed - no valid user returned')
        );
      }
      if (shouldGetApiTokens) {
        const [fetchError] = await to(apiTokenClient.fetch(user));
        if (fetchError) {
          if (removeUserWithoutTokens) {
            await removeUser();
          }
          return Promise.reject(fetchError);
        }
      }
      _isProcessingLogin = false;
      return Promise.resolve(user);
    },
    isAuthenticated: user => {
      const target = user || getUserFromStorageSyncronously();
      return !!target && isValidUser(target);
    },
    getUser: () => getUserFromStorageSyncronously(),
    logout: async logoutProps => {
      const { extraQueryParams = {}, language, ...rest } = logoutProps || {};
      if (language) {
        extraQueryParams.ui_locales = language;
      }
      return userManager.signoutRedirect({
        extraQueryParams,
        ...rest,
      });
    },
    getUserAndFetchTokens: async () => {
      const user = getUserFromStorageSyncronously();
      const isUserValid = await validateUserAndClearIfInvalid(user);
      if (!isUserValid) {
        return [null, null, undefined];
      }
      if (!shouldGetApiTokens) {
        return [user, null, undefined];
      }
      const tokens = apiTokenClient.getTokens();
      if (!tokens) {
        const [fetchError, fetchedTokens] = await to(
          apiTokenClient.fetch(user as User)
        );
        if (fetchError) {
          if (removeUserWithoutTokens) {
            await removeUser();
          }
          return Promise.reject([
            null,
            null,
            new Error('Failed to fetch api token'),
          ]);
        }
        return [user, fetchedTokens || null, undefined];
      }
      return [user, tokens, undefined];
    },
    getStoredUserAndTokens: () => {
      const user = getUserFromStorageSyncronously();
      if (!isValidUser(user)) {
        if (user) {
          removeApiTokens();
        }
        return [undefined, undefined];
      }
      if (!shouldGetApiTokens) {
        return [user, null];
      }
      const tokens = apiTokenClient.getTokens();

      if (!tokens) {
        return [null, null];
      }
      return [user, tokens];
    },
    getTokens: () => (apiTokenClient ? apiTokenClient.getTokens() : null),
    cleanUp: async () => {
      removeApiTokens();
      await removeUser();
    },
  };
}
