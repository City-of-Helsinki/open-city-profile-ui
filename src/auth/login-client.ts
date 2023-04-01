import {
  UserManager,
  UserManagerSettings,
  Log,
  SigninRedirectArgs,
  WebStorageStateStore,
  User,
  SignoutRedirectArgs,
} from 'oidc-client-ts';

import createApiTokenClient, { TokenData } from './api-token-client';

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
};

export type LoginClient = {
  login: (props?: LoginProps) => Promise<void>;
  logout: (props?: LogoutProps) => Promise<void>;
  handleCallback: () => Promise<User>;
  isAuthenticated: (user?: UserReturnType) => boolean;
  getUser: () => UserReturnType;
  getTokens: () => TokenData | null;
  getUserAndFetchTokens: () => Promise<[UserReturnType, TokenData | null]>;
  getStoredUserAndTokens: () => [
    UserReturnType | undefined,
    TokenData | null | undefined
  ];
  cleanUp: () => Promise<void>;
};

const getDefaultProps = (baseUrl: string): Partial<LoginClientProps> => ({
  defaultPollIntervalInMs: 60000,
  logger: console,
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

  const apiTokenClient = createApiTokenClient();
  let _isProcessingLogin = true;

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
  userManager.events.addUserLoaded(user => {
    if (!_isProcessingLogin && combinedProps.apiTokenUrl) {
      apiTokenClient.fetch(combinedProps.apiTokenUrl, user);
    }
  });

  userManager.events.addUserUnloaded(() => {
    apiTokenClient.clear();
  });

  const removeUser = async () => {
    await userManager.clearStaleState();
    await userManager.removeUser();
  };

  const removeApiToken = () => {
    apiTokenClient.clear();
  };

  const validateUserAndClearIfInvalid = async (
    user?: UserReturnType
  ): Promise<boolean> => {
    if (!isValidUser(user)) {
      if (user) {
        await removeUser();
        removeApiToken();
      }
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  };

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
      if (combinedProps.apiTokenUrl) {
        await apiTokenClient.fetch(combinedProps.apiTokenUrl, user);
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
        return [null, null];
      }
      if (!combinedProps.apiTokenUrl) {
        return [user, null];
      }
      const tokens = apiTokenClient.getTokens();

      if (!tokens) {
        const fetchedTokens = await apiTokenClient.fetch(
          combinedProps.apiTokenUrl,
          user as User
        );
        // if fetching fails, user should be cleared resetUser
        return [user, fetchedTokens as TokenData];
      }
      return [user, tokens];
    },
    getStoredUserAndTokens: () => {
      const user = getUserFromStorageSyncronously();
      if (!isValidUser(user)) {
        if (user) {
          removeApiToken();
        }
        return [undefined, undefined];
      }
      if (!combinedProps.apiTokenUrl) {
        return [user, null];
      }
      const tokens = apiTokenClient.getTokens();

      if (!tokens) {
        return [null, null];
      }
      return [user, tokens];
    },
    getTokens: () => apiTokenClient.getTokens(),
    cleanUp: async () => {
      removeApiToken();
      await removeUser();
    },
  };
}
