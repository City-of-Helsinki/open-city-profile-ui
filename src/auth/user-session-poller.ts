import { UserManager } from 'oidc-client-ts';
import HttpStatusCode from 'http-status-typed';

import createHttpPoller from './http-poller';
import { createFetchCanceller } from '../common/helpers/fetchCanceller';

export type UserSessionPoller = {
  start: () => void;
  stop: () => void;
};

export type UserSessionPollerOptions = {
  userManager: UserManager;
  pollIntervalInMs: number;
  onError: () => void;
  shouldPoll: () => boolean;
};

export default function createUserSessionPoller(
  options: UserSessionPollerOptions
): UserSessionPoller {
  const {
    userManager,
    pollIntervalInMs,
    onError: onErrorCallback,
    shouldPoll,
  } = options;
  const fetchCanceller = createFetchCanceller();
  const userInfoFetchFunction = async (): Promise<Response | undefined> => {
    const uri = await userManager.metadataService.getUserInfoEndpoint();
    const user = await userManager.getUser();
    const accessToken = user && user.access_token;
    if (!accessToken) {
      return Promise.reject(new Error('Access token not set'));
    }
    const headers = new Headers();
    headers.append('authorization', `Bearer ${accessToken}`);

    return fetch(uri, {
      method: 'GET',
      headers,
      signal: fetchCanceller.getSignal(),
    });
  };

  const poller = createHttpPoller({
    pollIntervalInMs,
    pollFunction: userInfoFetchFunction,
    shouldPoll,
    onError: returnedHttpStatus => {
      if (fetchCanceller.isCancelled()) {
        return { keepPolling: false };
      }
      if (
        returnedHttpStatus &&
        (returnedHttpStatus === HttpStatusCode.FORBIDDEN ||
          returnedHttpStatus === HttpStatusCode.UNAUTHORIZED)
      ) {
        onErrorCallback();
        return { keepPolling: false };
      }
      return { keepPolling: shouldPoll() };
    },
  });

  return {
    start: () => {
      console.log('START POLLING');
      poller.start();
    },
    stop: () => {
      console.log('STOP POLLING');
      fetchCanceller.cancel();
      poller.stop();
    },
  };
}
