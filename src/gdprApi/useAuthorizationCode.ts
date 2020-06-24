import React from 'react';

import useActionResumer from './useActionResumer';
import gdprAuthCodeManager from './gdprAuthCodeManager';

function useAuthorizationCode(
  deferredAction: string,
  callback: (authorizationToken: string | null) => void
): [(additionalScopes: string[]) => void, boolean] {
  const startAuthorizationCodeRetrievalFlow = React.useCallback(
    (additionalScopes: string[]) => {
      const scopes = ['openid', ...additionalScopes];

      gdprAuthCodeManager.fetchAuthorizationCode(deferredAction, scopes);
    },
    [deferredAction]
  );

  const endAuthorizationCodeRetrievalFlow = React.useCallback(() => {
    try {
      const code = gdprAuthCodeManager.consumeCode();

      callback(code);
    } catch {
      callback(null);
    }
  }, [callback]);

  const [
    startFetchingAuthorizationCode,
    isFetchingAuthorizationCode,
  ] = useActionResumer(
    deferredAction,
    startAuthorizationCodeRetrievalFlow,
    endAuthorizationCodeRetrievalFlow
  );

  return [startFetchingAuthorizationCode, isFetchingAuthorizationCode];
}

export default useAuthorizationCode;
