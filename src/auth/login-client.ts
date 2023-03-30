import {
  UserManager,
  UserManagerSettings,
  Log,
  SigninRedirectArgs,
  WebStorageStateStore,
  User,
} from 'oidc-client-ts';

export type LoginProps = {
  language?: string;
} & SigninRedirectArgs;

export type UserReturnType = User | null;

export type LoginClientProps = {
  userManagerSettings: Partial<UserManagerSettings>;
  defaultPollIntervalInMs?: number;
  logLevel?: Log;
  logger?: Parameters<typeof Log.setLogger>[0];
};

export type LoginClient = {
  login: (props?: LoginProps) => Promise<void>;
  handleCallback: () => Promise<User>;
  isAuthenticated: (user?: UserReturnType) => boolean;
  getCurrentUser: () => UserReturnType;
  getUser: () => Promise<UserReturnType>;
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

  let currentUser: UserReturnType = null;
  //let _isProcessingLogin = true;

  const isUserExpired = (user?: Partial<User> | null): boolean => {
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
  };

  const isAuthenticatedUser = (user?: User | null): boolean =>
    !!user && !isUserExpired(user) && !!user.access_token;

  userManager.events.addUserLoaded(user => {
    console.log('userloaded');
    currentUser = user;
  });

  return {
    login: async loginProps => {
      const { extraQueryParams = {}, state, language } = loginProps || {};
      if (language) {
        extraQueryParams.ui_locales = language;
      }
      return userManager.signinRedirect({
        extraQueryParams,
        state,
      });
    },
    handleCallback: async () => {
      //_isProcessingLogin = true;
      const user = await userManager.signinRedirectCallback();
      if (!isAuthenticatedUser(user)) {
        return Promise.reject(
          new Error('Login failed - no valid user returned')
        );
      }
      currentUser = user;
      //_isProcessingLogin = false;
      return Promise.resolve(user);
    },
    isAuthenticated: user => {
      const target = user || currentUser;
      return !!target && isAuthenticatedUser(target);
    },
    getCurrentUser: () => currentUser,
    getUser: () => userManager.getUser(),
  };
}
