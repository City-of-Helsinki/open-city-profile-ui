import to from 'await-to-js';
import { User } from 'oidc-client-ts';

export type TokenData = Record<string, string>;
type FetchResult = TokenData | FetchError;
export type ApiTokenClient = {
  fetch: (uri: string, user: User) => Promise<FetchResult>;
  getToken: (name: string) => string | undefined;
  getTokens: () => TokenData;
  clear: () => void;
};

export type FetchApiTokenOptions = {
  uri: string;
  accessToken: string;
  signal?: AbortSignal;
};

export type FetchError = {
  status?: number;
  error?: Error;
  message?: string;
};

export const API_TOKEN_SESSION_STORAGE_KEY = 'api_token_key';

async function fetchApiToken(
  options: FetchApiTokenOptions
): Promise<FetchResult> {
  const { uri, signal, accessToken } = options;
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${accessToken}`);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    signal,
  };

  const [fetchError, fetchResponse]: [
    Error | null,
    Response | undefined
  ] = await to(fetch(uri, requestOptions));
  if (fetchError || !fetchResponse) {
    return {
      error: fetchError,
      message: 'Network or CORS error occured',
    } as FetchError;
  }
  if (!fetchResponse.ok) {
    return {
      status: fetchResponse.status,
      message: fetchResponse.statusText,
      error: new Error(await fetchResponse.text()),
    } as FetchError;
  }
  const [parseError, json] = await to(fetchResponse.json());
  if (parseError) {
    return {
      error: parseError,
      message: 'Returned data is not valid json',
    } as FetchError;
  }
  return json as TokenData;
}

export default function createApiTokenClient(): ApiTokenClient {
  let abortController: AbortController | undefined;
  const abort = () => {
    if (abortController) {
      abortController.abort();
    }
    abortController = undefined;
  };

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
  let tokens: TokenData = getStoredTokens() || {};
  return {
    fetch: async (uri, user) => {
      abort();
      abortController = new AbortController();
      const { signal } = abortController;
      const { access_token: accessToken } = user;
      const result = await fetchApiToken({ uri, accessToken, signal });
      abortController = undefined;
      tokens = {};
      clearStoredTokens();
      if (!(result as FetchError).error) {
        tokens = { ...(result as TokenData) };
      }
      // should reject if error
      setStoredTokens(tokens);
      return tokens;
    },
    getToken: name => tokens[name],
    getTokens: () => tokens,
    clear: () => {
      abort();
      clearStoredTokens();
      tokens = {};
    },
  };
}
