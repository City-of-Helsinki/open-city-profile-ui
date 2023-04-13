import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import createLoginClient, {
  LoginClient,
  LoginClientData,
  LoginClientProps,
  LoginClientStateChange,
  LoginClientStateListener,
} from './login-client';
import { TokenData } from './api-token-client';

type ContextProps = {
  children: React.ReactNode | React.ReactNode[] | null;
  loginProps: LoginClientProps;
};

export type LoginContextData = {
  getClient: () => LoginClient;
  addStateListener: (listener: LoginClientStateListener) => () => void;
};

export const LoginContext = createContext<LoginContextData>({
  getClient: () => {
    throw new Error('Not initialized');
  },
  addStateListener: () => () => undefined,
});

export const Provider = (props: ContextProps): React.ReactElement => {
  const { children, loginProps } = props;
  const clientRef = useRef<LoginClient | undefined>(undefined);
  const eventListenerRef = useRef<Set<LoginClientStateListener> | undefined>(
    undefined
  );
  const addStateListener = (listener: LoginClientStateListener) => {
    if (!eventListenerRef.current) {
      eventListenerRef.current = new Set();
    }
    eventListenerRef.current.add(listener);
    return () => {
      if (eventListenerRef.current) {
        eventListenerRef.current.delete(listener);
      }
    };
  };
  const clientStateListener: LoginClientStateListener = stateAndError => {
    const listeners = eventListenerRef.current;
    if (!listeners || !listeners.size) {
      return;
    }
    listeners.forEach(callback => {
      callback(stateAndError);
    });
  };
  const contextData = {
    getClient: () => {
      if (!clientRef.current) {
        clientRef.current = createLoginClient({
          ...loginProps,
          onStateChange: clientStateListener,
        });
      }
      return clientRef.current;
    },
    addStateListener,
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

export const useAuthenticatedUser = (): LoginClientData => {
  const client = useLoginClient();
  return client.getStoredUserAndTokens();
};

export const useApiTokens = (): (() => Promise<TokenData | null>) => {
  const client = useLoginClient();
  return async () => await client.getUpdatedTokens();
};
/*
export const useAuthenticatedUser = (): LoginClientData => {
  const client = useLoginClient();
  const [storedData, setStoredData] = useState<
    [
      UserReturnType | undefined,
      TokenData | null | undefined,
      LoginClientError | undefined
    ]
  >(client.getStoredUserAndTokens());
  const [user, tokens, error] = storedData;
  const hasValidData = !!user && !error;
  useEffect(() => {
    async function getter() {
      const data = await client.getUserAndFetchTokens();
      setStoredData(data);
    }
    if (!hasValidData) {
      getter();
    }
  }, [client, hasValidData]);

  if (user === null) {
    return { resolving: false, user, tokens, error };
  } else if (user) {
    return { resolving: false, user, tokens, error };
  }
  return { resolving: true, user, tokens, error };
};*/

export const useLoginStateListener = (
  listener?: LoginClientStateListener
): LoginClientStateChange => {
  const { addStateListener, getClient } = useContext(LoginContext);
  const client = getClient();
  const [currentStateAndError, updateCurrentStateAndError] = useState<
    LoginClientStateChange
  >({
    state: client.getState(),
    previousState: undefined,
  });
  const memoizedListener = useMemo<LoginClientStateListener>(
    () => change => {
      if (listener) {
        listener(change);
      }
      updateCurrentStateAndError(change);
    },
    [listener, updateCurrentStateAndError]
  );
  useEffect(() => {
    const disposer = addStateListener(memoizedListener);
    return disposer;
  }, [memoizedListener, addStateListener]);
  return currentStateAndError;
};
