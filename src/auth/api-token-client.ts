import to from 'await-to-js';
import { User } from 'oidc-client-ts';

import { createFetchCanceller } from '../common/helpers/fetchCanceller';
import retryPollingUntilSuccessful from './http-poller-with-promises';
import LoginClientError from './login-client-error';

export type TokenData = Record<string, string>;
export type ApiTokenClient = {
  fetch: (user: User) => Promise<TokenData>;
  getToken: (name: string) => string | undefined;
  getTokens: () => TokenData | null;
  clear: () => void;
};

export type ApiTokenClientProps = {
  url: string;
  maxRetries?: number;
  retryInterval?: number;
};

export type FetchApiTokenOptions = {
  url: string;
  accessToken: string;
  signal?: AbortSignal;
  maxRetries?: number;
  retryInterval?: number;
};

export const API_TOKEN_SESSION_STORAGE_KEY = 'api_token_key';

async function fetchApiToken(
  options: FetchApiTokenOptions
): Promise<TokenData | LoginClientError> {
  const {
    url,
    signal,
    accessToken,
    maxRetries = 4,
    retryInterval = 500,
  } = options;
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${accessToken}`);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    signal,
  };

  const pollFunction = () => fetch(url, requestOptions);

  const [fetchError, fetchResponse] = await to(
    retryPollingUntilSuccessful({
      pollFunction,
      pollIntervalInMs: retryInterval,
      maxRetries,
    })
  );

  if (fetchError || !fetchResponse) {
    return new LoginClientError(
      'Network or CORS error occured',
      'API_TOKEN_NETWORK_OR_CORS_ERROR',
      fetchError
    );
  }
  if (!fetchResponse.ok) {
    const message = await fetchResponse.text();
    return new LoginClientError(
      `${message}.${fetchResponse.statusText} Status:${fetchResponse.status}`,
      'API_TOKENS_FAILED',
      fetchError
    );
  }
  const [parseError, json] = await to(fetchResponse.json());
  if (parseError) {
    return new LoginClientError(
      parseError.message,
      'INVALID_API_TOKENS',
      parseError
    );
  }
  return json as TokenData;
}

export default function createApiTokenClient(
  props: ApiTokenClientProps
): ApiTokenClient {
  const { url, maxRetries, retryInterval } = props;
  const fetchCanceller = createFetchCanceller();

  const getStoredTokens = (): TokenData | null => {
    const tokensString = sessionStorage.getItem(API_TOKEN_SESSION_STORAGE_KEY);
    try {
      return tokensString ? JSON.parse(tokensString) : null;
    } catch (e) {
      return null;
    }
  };

  const clearStoredTokens = (): void =>
    sessionStorage.removeItem(API_TOKEN_SESSION_STORAGE_KEY);

  const setStoredTokens = (tokenObj: TokenData): void => {
    sessionStorage.setItem(
      API_TOKEN_SESSION_STORAGE_KEY,
      JSON.stringify(tokenObj)
    );
  };
  let tokens: TokenData | null = getStoredTokens() || null;
  return {
    fetch: async user => {
      fetchCanceller.cancel();
      const { access_token: accessToken } = user;
      const result = await fetchApiToken({
        url,
        accessToken,
        signal: fetchCanceller.getSignal(),
        maxRetries,
        retryInterval,
      });
      clearStoredTokens();
      if (result instanceof Error) {
        return Promise.reject(result);
      }
      tokens = { ...result };
      setStoredTokens(tokens);
      return Promise.resolve(tokens);
    },
    getToken: name => (tokens ? tokens[name] : undefined),
    getTokens: () => tokens,
    clear: () => {
      fetchCanceller.cancel();
      clearStoredTokens();
      tokens = null;
    },
  };
}
