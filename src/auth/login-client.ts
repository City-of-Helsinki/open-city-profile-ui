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
  getCurrentUser: () => UserReturnType;
  getUser: () => Promise<UserReturnType>;
  getTokens: () => TokenData | null;
  getUserAndFetchTokens: () => Promise<[UserReturnType, TokenData | null]>;
  getStoredUserAndTokens: () => [
    UserReturnType | undefined,
    TokenData | null | undefined
  ];
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

  const combinedProps: LoginClientProps = {
    ...restDefaultProps,
    ...restProps,
    userManagerSettings: {
      ...defaultUserManagerSettings,
      ...userManagerSettingsFromProps,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    },
  };
  const userManager = new UserManager(
    combinedProps.userManagerSettings as UserManagerSettings
  );

  const apiTokenClient = createApiTokenClient();

  let currentUser: UserReturnType = null;
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

  const isValidUser = (user?: User | null): boolean =>
    !!user && !isUserExpired(user) && !!user.access_token;

  // This is called by userManager while processing endLogin()
  // and when silent renew is complete
  // endLogin() also calls fetchApiToken. Multiple calls are prevented with _isProcessingLogin
  userManager.events.addUserLoaded(user => {
    console.log('userloaded');
    currentUser = user;
    if (!_isProcessingLogin && combinedProps.apiTokenUrl) {
      apiTokenClient.fetch(combinedProps.apiTokenUrl, user);
    }
  });

  userManager.events.addUserUnloaded(() => {
    console.log('userunloaded');
    currentUser = null;
    apiTokenClient.clear();
  });

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
      currentUser = user;
      if (combinedProps.apiTokenUrl) {
        await apiTokenClient.fetch(combinedProps.apiTokenUrl, user);
      }
      _isProcessingLogin = false;
      return Promise.resolve(user);
    },
    isAuthenticated: user => {
      const target = user || currentUser;
      return !!target && isValidUser(target);
    },
    getCurrentUser: () => currentUser,
    getUser: () => userManager.getUser(),
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
      const user = await userManager.getUser();
      if (!isValidUser(user)) {
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
      if (!isValidUser(currentUser)) {
        return [undefined, undefined];
      }
      if (!combinedProps.apiTokenUrl) {
        return [currentUser, null];
      }
      const tokens = apiTokenClient.getTokens();

      if (!tokens) {
        return [null, null];
      }
      return [currentUser, tokens];
    },
    getTokens: () => apiTokenClient.getTokens(),
  };
}
