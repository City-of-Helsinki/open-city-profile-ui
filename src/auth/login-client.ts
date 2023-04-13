import {
  UserManager,
  UserManagerSettings,
  SigninRedirectArgs,
  WebStorageStateStore,
  User,
  SignoutRedirectArgs,
} from 'oidc-client-ts';
import to from 'await-to-js';
import jwtDecode from 'jwt-decode';

import createApiTokenClient, {
  ApiTokenClient,
  TokenData,
} from './api-token-client';
import createUserSessionPoller, {
  UserSessionPoller,
} from './user-session-poller';
import { createRenewalTrackingPromise } from './user-renewal-promise';
import LoginClientError, { LoginClientErrorType } from './login-client-error';
import { HttpPoller } from './http-poller';

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
export type LoginClientData = [UserInData, TokensInData, ErrorInData];
export type LoginClientState =
  | 'NO_SESSION'
  | 'VALID_SESSION'
  | 'LOGGING_IN'
  | 'LOGGING_OUT';

export type LoginClientStateChange = {
  state: LoginClientState;
  previousState?: LoginClientState;
  error?: LoginClientError;
};

export type LoginClientStateListener = (
  newStateAndError: LoginClientStateChange
) => void;

export type LoginClientProps = {
  userManagerSettings: Partial<UserManagerSettings>;
  defaultPollIntervalInMs?: number;
  apiTokenUrl?: string;
  apiTokenMaxRetries?: number;
  apiTokenRetryIntervalInMs?: number;
  sessionPollingIntervalInMs?: number;
  onStateChange?: LoginClientStateListener;
};

export type LoginClient = {
  login: (props?: LoginProps) => Promise<void>;
  logout: (props?: LogoutProps) => Promise<void>;
  handleCallback: () => Promise<LoginClientData>;
  isAuthenticated: (user?: UserReturnType) => boolean;
  getUser: () => UserReturnType;
  getTokens: () => TokenData | null;
  getUserAndFetchTokens: () => Promise<LoginClientData>;
  getUpdatedTokens: () => Promise<TokenData | null>;
  getStoredUserAndTokens: () => LoginClientData;
  cleanUp: () => Promise<void>;
  isRenewing: () => boolean;
  getUserManager: () => UserManager;
  getApiTokenClient: () => ApiTokenClient | undefined;
  getSessionPoller: () => HttpPoller | undefined;
  getState: () => LoginClientState;
  getAmr: () => User['profile']['amr'] | undefined;
};

const getDefaultProps = (baseUrl: string): Partial<LoginClientProps> => ({
  defaultPollIntervalInMs: 60000,
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

export const getUserStoreKey = (
  settings: Partial<UserManagerSettings>
): string =>
  // "oidc" is the default prefix passed in oidc-client-ts
  // "user" is the userStoreKey in oidc-client-ts
  `oidc.user:${settings.authority}:${settings.client_id}`;

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
  let state: LoginClientState = 'NO_SESSION';
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
  let renewPromise: Promise<LoginClientData> | undefined;

  const changeState = (newState: LoginClientState) => {
    if (state === newState) {
      return;
    }
    const previousState = state;
    state = newState;
    if (combinedProps.onStateChange) {
      combinedProps.onStateChange({ state, previousState });
    }
  };

  const dispatchError = (error: LoginClientError) => {
    if (combinedProps.onStateChange) {
      combinedProps.onStateChange({ state, previousState: state, error });
    }
  };

  const startSessionPollingIfRequired = () => {
    if (!sessionPollingIntervalInMs) {
      return;
    }
    if (!sessionPoller) {
      sessionPoller = createUserSessionPoller({
        userManager,
        pollIntervalInMs: sessionPollingIntervalInMs,
        shouldPoll: () => state === 'VALID_SESSION',
        onError: () => {
          dispatchError(
            new LoginClientError(
              'Session polling failed',
              'UNAUTHORIZED_SESSION'
            )
          );
        },
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

  const createDataArrayWithError = (
    type: LoginClientErrorType,
    message?: string
  ): LoginClientData => [
    null,
    null,
    new LoginClientError(message || `${type} error`, type),
  ];

  // when apiTokenUrl is set and therefore apiTokens are required,
  // there should not be a case where user is stored, but apiTokens are not found.
  // Data is out of sync, so stored user should be removed.
  const handleValidUserWithoutRequiredApiTokens = (
    user: User
  ): LoginClientData => {
    if (!shouldGetApiTokens) {
      return [user, null, undefined];
    }
    const tokens = apiTokenClient.getTokens();
    if (tokens) {
      return [user, tokens, undefined];
    }
    removeUser().catch(() => {
      // removeUser is async, so handling the promise silently with empty function
      // the function will never reject when localStorage is used.
    });
    return createDataArrayWithError(
      'USER_HAS_INVALID_TOKENS',
      'User found without required tokens'
    );
  };

  const getUserFromStorageSyncronously = (): UserReturnType => {
    const userData = store.getItem(
      getUserStoreKey(combinedProps.userManagerSettings)
    );
    if (!userData) {
      return null;
    }
    try {
      const user = JSON.parse(userData);
      if (!user) {
        return null;
      }
      const [verifiedUser, , error] = handleValidUserWithoutRequiredApiTokens(
        user
      );
      return error || !verifiedUser ? null : user;
    } catch (e) {
      return null;
    }
  };

  const isValidUser = (user?: User | null): boolean =>
    !!user && !isUserExpired(user) && !!user.access_token;

  const getSyncStoredData = (currentUser?: UserInData): LoginClientData => {
    const user =
      currentUser !== undefined
        ? currentUser
        : getUserFromStorageSyncronously();
    if (!isValidUser(user)) {
      return createDataArrayWithError('INVALID_OR_EXPIRED_USER');
    }

    // token existance is checked in getUserFromStorageSyncronously
    // tokens exist, if user exists.
    return [
      user,
      apiTokenClient ? (apiTokenClient.getTokens() as TokenData) : null,
      undefined,
    ];
  };
  const getAsyncStoredData = async (
    currentUser?: UserInData
  ): Promise<LoginClientData> => {
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
          return [user, null, fetchError];
        }
        return [user, fetchedTokens || null, undefined];
      }
      return [user, tokens, undefined];
    }
    return [user, null, undefined];
  };

  const getAsyncStoredOrRenewingData = async (
    currentUser?: UserInData
  ): Promise<LoginClientData> =>
    isRenewing()
      ? (renewPromise as Promise<LoginClientData>)
      : getAsyncStoredData(currentUser);

  const createRenewalPromise = async (): Promise<LoginClientData> => {
    const [err, user] = await to(createRenewalTrackingPromise(userManager));
    if (!err && shouldGetApiTokens) {
      apiTokenClient.clear();
      const [, tokens, error] = await getAsyncStoredData(user as User);
      if (error) {
        return Promise.resolve([undefined, undefined, error]);
      }
      return Promise.resolve([user as User, tokens, undefined]);
    }
    return Promise.resolve([
      user as User,
      undefined,
      err
        ? new LoginClientError('Renew failed', 'RENEWAL_FAILED', err)
        : undefined,
    ]);
  };

  const getAmr = (): User['profile']['amr'] | undefined => {
    const [user] = getSyncStoredData();
    if (!user || !user.id_token) {
      return undefined;
    }
    if (user.profile && Array.isArray(user.profile.amr)) {
      return user.profile.amr.length ? user.profile.amr : undefined;
    }

    try {
      const decodedToken = jwtDecode<Record<string, string>>(user.id_token);
      const amr = decodedToken.amr;
      if (!amr) {
        return undefined;
      }
      return Array.isArray(amr) ? amr : [amr];
    } catch (e) {
      return undefined;
    }
  };

  const onSessionEnd = () => {
    removeApiTokens();
    stopSessionPolling();
    if (apiTokenClient) {
      apiTokenClient.clear();
    }
    changeState('NO_SESSION');
  };

  userManager.events.addUserUnloaded(() => {
    onSessionEnd();
  });

  userManager.events.addUserSignedOut(() => {
    onSessionEnd();
  });

  userManager.events.addAccessTokenExpiring(async () => {
    stopSessionPolling();
    renewPromise = createRenewalPromise();
    const [, , error] = await renewPromise;
    if (error) {
      dispatchError(error);
    }
    startSessionPollingIfRequired();
    renewPromise = undefined;
  });

  if (isValidUser(getUserFromStorageSyncronously())) {
    startSessionPollingIfRequired();
    state = 'VALID_SESSION';
  }

  return {
    login: async loginProps => {
      const { extraQueryParams = {}, language, ...rest } = loginProps || {};
      if (language) {
        extraQueryParams.ui_locales = language;
      }
      changeState('LOGGING_IN');
      return userManager.signinRedirect({
        extraQueryParams,
        ...rest,
      });
    },
    handleCallback: async () => {
      changeState('LOGGING_IN');
      const currentUser = await userManager.signinRedirectCallback();
      const data = await getAsyncStoredData(currentUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [user, tokens, error] = data;
      if (error) {
        await removeUser();
        changeState('NO_SESSION');
        dispatchError(error);
        return Promise.reject(error);
      }
      changeState('VALID_SESSION');
      startSessionPollingIfRequired();
      return Promise.resolve(data);
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
      changeState('LOGGING_OUT');
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
      state = 'NO_SESSION';
    },
    getState: () => state,
    getUserManager: () => userManager,
    getApiTokenClient: () => apiTokenClient,
    getSessionPoller: () => sessionPoller,
    getAmr,
  };
}
