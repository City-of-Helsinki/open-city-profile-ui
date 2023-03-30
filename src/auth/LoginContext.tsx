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

type ContextProps = {
  children: React.ReactNode | React.ReactNode[] | null;
  loginProps: LoginClientProps;
};

export type LoginContextData = {
  getClient: () => LoginClient;
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

export const useAuthenticatedUser = (): {
  resolving: boolean;
  user: UserReturnType | undefined;
} => {
  const client = useLoginClient();
  const [storedUser, setStoredUser] = useState<UserReturnType | undefined>(
    client.getCurrentUser() || undefined
  );
  const hasUser = !!storedUser;
  useEffect(() => {
    async function getter() {
      const user = await client.getUser();
      setStoredUser(user);
    }
    if (!hasUser) {
      getter();
    }
  }, [client, hasUser]);
  if (storedUser === null) {
    return { resolving: false, user: null };
  } else if (storedUser && client.isAuthenticated(storedUser)) {
    return { resolving: false, user: storedUser };
  }
  return { resolving: true, user: undefined };
};
