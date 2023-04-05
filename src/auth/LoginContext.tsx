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
  error?: Error;
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

export const useAuthenticatedUser = (): AuthenticatedUserData => {
  const client = useLoginClient();
  const [storedData, setStoredData] = useState<
    [
      UserReturnType | undefined,
      TokenData | null | undefined,
      Error | undefined
    ]
  >(client.getStoredUserAndTokens());
  const [storedUser, tokens, error] = storedData;
  const hasValidData = storedUser !== undefined;
  useEffect(() => {
    async function getter() {
      const data = await client.getUserAndFetchTokens();
      setStoredData(data);
    }
    if (!hasValidData) {
      getter();
    }
  }, [client, hasValidData]);

  if (storedUser === null) {
    return { resolving: false, user: null, tokens, error };
  } else if (storedUser) {
    return { resolving: false, user: storedUser, tokens, error };
  }
  return { resolving: true, user: undefined, tokens, error };
};
