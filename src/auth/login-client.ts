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
import { createUserLoadTrackerPromise } from './user-load-promise';
import LoginClientError, { LoginClientErrorType } from './login-client-error';

export type LoginProps = {
  language?: string;
} & SigninRedirectArgs;

export type LogoutProps = {
  language?: string;
} & SignoutRedirectArgs;

export type UserReturnType = User | null;
type UserInData = UserReturnType | undefined;
type TokensInData = TokenData | null | undefined;
type ErrorInData = LoginClientError | undefined;
type DataArray = [UserInData, TokensInData, ErrorInData];

export type LoginClientProps = {
  userManagerSettings: Partial<UserManagerSettings>;
  defaultPollIntervalInMs?: number;
  logLevel?: Log;
  logger?: Parameters<typeof Log.setLogger>[0];
  apiTokenUrl?: string;
  apiTokenMaxRetries?: number;
  apiTokenRetryIntervalInMs?: number;
  sessionPollingIntervalInMs?: number;
};

export type LoginClient = {
  login: (props?: LoginProps) => Promise<void>;
  logout: (props?: LogoutProps) => Promise<void>;
  handleCallback: () => Promise<User>;
  isAuthenticated: (user?: UserReturnType) => boolean;
  getUser: () => UserReturnType;
  getTokens: () => TokenData | null;
  getUserAndFetchTokens: () => Promise<DataArray>;
  getUpdatedTokens: () => Promise<TokenData | null>;
  getStoredUserAndTokens: () => DataArray;
  cleanUp: () => Promise<void>;
  isRenewing: () => boolean;
  getUserManager: () => UserManager;
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
    accessTokenExpiringNotificationTimeInSeconds: 3555,
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
  } = combinedProps;

  const apiTokenClient = apiTokenUrl
    ? createApiTokenClient({
        url: apiTokenUrl,
        maxRetries: apiTokenMaxRetries,
        retryInterval: apiTokenRetryIntervalInMs,
      })
    : undefined;
  const shouldGetApiTokens = !!apiTokenClient;
  let renewPromise: Promise<DataArray> | undefined;

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

  const isRenewing = () => !!renewPromise;

  const removeUser = async () => {
    await userManager.clearStaleState();
    await userManager.removeUser();
  };

  const removeApiTokens = () => {
    if (apiTokenClient) {
      apiTokenClient.clear();
    }
  };

  const createDataArrayWithError = (type: LoginClientErrorType): DataArray => [
    null,
    null,
    new LoginClientError(`${type} error`, type),
  ];

  const getSyncStoredData = (currentUser?: UserInData): DataArray => {
    const user =
      currentUser !== undefined
        ? currentUser
        : getUserFromStorageSyncronously();
    if (!isValidUser(user)) {
      return createDataArrayWithError('INVALID_OR_EXPIRED_USER');
    }
    if (shouldGetApiTokens) {
      const tokens = apiTokenClient.getTokens();
      return [user, tokens, undefined];
    }
    return [user, null, undefined];
  };

  const getAsyncStoredData = async (
    currentUser?: UserInData
  ): Promise<DataArray> => {
    const user =
      currentUser !== undefined ? currentUser : await userManager.getUser();
    if (!isValidUser(user)) {
      return createDataArrayWithError('INVALID_OR_EXPIRED_USER');
    }
    if (shouldGetApiTokens) {
      const tokens = apiTokenClient.getTokens();
      if (!tokens) {
        const [fetchError, fetchedTokens] = await to<
          TokenData,
          LoginClientError
        >(apiTokenClient.fetch(user as User));
        if (fetchError) {
          return Promise.reject(fetchError);
        }
        return [user, fetchedTokens || null, undefined];
      }
      return [user, tokens, undefined];
    }
    return [user, null, undefined];
  };

  const getAsyncStoredOrRenewingData = async (
    currentUser?: UserInData
  ): Promise<DataArray> =>
    isRenewing()
      ? (renewPromise as Promise<DataArray>)
      : getAsyncStoredData(currentUser);

  const createRenewalPromise = async (): Promise<DataArray> => {
    const [err, user] = await to(createUserLoadTrackerPromise(userManager));
    if (!err && shouldGetApiTokens) {
      const [, tokens, error] = await getAsyncStoredData(user as User);
      if (error) {
        return Promise.resolve([undefined, undefined, error]);
      }
      return Promise.resolve([user as User, tokens, undefined]);
    }
    return Promise.resolve([user as User, undefined, undefined]);
  };

  if (isValidUser(getUserFromStorageSyncronously())) {
    startSessionPollingIfRequired();
  }

  userManager.events.addUserUnloaded(() => {
    removeApiTokens();
    stopSessionPolling();
  });

  userManager.events.addAccessTokenExpiring(async () => {
    stopSessionPolling();
    renewPromise = createRenewalPromise();
    await renewPromise;
    startSessionPollingIfRequired();
    renewPromise = undefined;
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
      const currentUser = await userManager.signinRedirectCallback();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [user, tokens, error] = await getAsyncStoredData(currentUser);
      if (error) {
        await removeUser();
        return Promise.reject(error);
      }
      return Promise.resolve(user as User);
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
    getUserAndFetchTokens: async () => await getAsyncStoredOrRenewingData(),
    getStoredUserAndTokens: () => getSyncStoredData(),
    getTokens: () => (apiTokenClient ? apiTokenClient.getTokens() : null),
    getUpdatedTokens: async () => {
      if (!apiTokenUrl) {
        return Promise.reject(
          new LoginClientError('Missing apiTokenUrl', 'NO_API_TOKEN_URL')
        );
      }
      const [, tokens, error] = await getAsyncStoredOrRenewingData();
      return error
        ? Promise.reject(error)
        : Promise.resolve(tokens as TokenData);
    },
    isRenewing,
    cleanUp: async () => {
      removeApiTokens();
      await removeUser();
    },
    getUserManager: () => userManager,
  };
}
