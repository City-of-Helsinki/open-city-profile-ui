import { v4 as uuidv4 } from 'uuid';
import to from 'await-to-js';
import { useCallback, useEffect, useState, useRef } from 'react';

import {
  iFrameUrlLoader,
  cleanUpIFrame,
} from '../common/iframe/iFrameUrlLoader';
import gdprAuthCodeManager from './gdprAuthCodeManager';

function useAuthorizationCodeIFrame(
  callback: (authorizationToken: string | null) => void
): [(additionalScopes: string[]) => void, boolean, string | null | undefined] {
  const [
    isFetchingAuthorizationCode,
    setIsFetchingAuthorizationCode,
  ] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const isUnmountingRef = useRef<boolean>(false);
  const iframeName = 'authCodeGetter';
  const fetch = useCallback(
    async (additionalScopes: string[]) => {
      const scopes = ['openid', ...additionalScopes];
      const state = uuidv4();
      const url = gdprAuthCodeManager.makeAuthorizationUrl(scopes, state);
      setIsFetchingAuthorizationCode(true);
      const [, data] = await to(
        iFrameUrlLoader<{ code: string; state: string }>(
          url,
          iframeName,
          messageData =>
            typeof messageData === 'object' &&
            !!messageData.state &&
            messageData.state === state
        )
      );
      // should not call useState when unmounted.
      // iFrameUrlLoader is async and can be resolved after this hook unmounts
      if (isUnmountingRef.current) {
        return;
      }
      setIsFetchingAuthorizationCode(false);
      const dataCode = !data ? null : data.code;
      setCode(dataCode);
      callback(dataCode);
    },
    [callback]
  );

  useEffect(
    () => () => {
      isUnmountingRef.current = true;
      cleanUpIFrame(iframeName);
    },
    // disabled because the function should only be run when unmounting
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return [fetch, isFetchingAuthorizationCode, code];
}

export default useAuthorizationCodeIFrame;
