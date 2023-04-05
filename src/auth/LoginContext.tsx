import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import createLoginClient, {
  LoginClient,
  LoginClientProps,
  UserReturnType,
} from './login-client';
import { TokenData } from './api-token-client';
import LoginClientError from './login-client-error';

type ContextProps = {
  children: React.ReactNode | React.ReactNode[] | null;
  loginProps: LoginClientProps;
};

export type LoginContextData = {
  getClient: () => LoginClient;
};

export type AuthenticatedUserData = {
  resolving: boolean;
  user: UserReturnType | undefined;
  tokens: TokenData | null | undefined;
  error?: LoginClientError;
};

export const LoginContext = createContext<LoginContextData>({
  getClient: () => {
    throw new Error('Not initialized');
  },
});

export const Provider = (props: ContextProps): React.ReactElement => {
  const { children, loginProps } = props;
  const clientRef = useRef<LoginClient | undefined>(undefined);
  const contextData = {
    getClient: () => {
      if (!clientRef.current) {
        clientRef.current = createLoginClient(loginProps);
      }
      return clientRef.current;
    },
  };

  return (
    <LoginContext.Provider value={contextData}>
      {children}
    </LoginContext.Provider>
  );
};

export const { Consumer } = LoginContext;

export const useLoginClient = (): LoginClient => {
  const { getClient } = useContext(LoginContext);
  return getClient();
};

export const useAuthenticatedUser = (
  validUserMustHaveTokens?: boolean
): AuthenticatedUserData => {
  const client = useLoginClient();
  const [storedData, setStoredData] = useState<
    [
      UserReturnType | undefined,
      TokenData | null | undefined,
      LoginClientError | undefined
    ]
  >(client.getStoredUserAndTokens());
  const [user, tokens, error] = storedData;
  const hasValidData = user !== undefined;
  useEffect(() => {
    async function getter() {
      const data = await client.getUserAndFetchTokens();
      setStoredData(data);
    }
    if (!hasValidData) {
      getter();
    }
  }, [client, hasValidData]);

  if (user && !tokens && validUserMustHaveTokens) {
    return {
      resolving: false,
      user: null,
      tokens,
      error: new LoginClientError(
        'Valid user does not have tokens',
        'USER_HAS_INVALID_TOKENS'
      ),
    };
  }

  if (user === null) {
    return { resolving: false, user, tokens, error };
  } else if (user) {
    return { resolving: false, user, tokens, error };
  }
  return { resolving: true, user, tokens, error };
};
