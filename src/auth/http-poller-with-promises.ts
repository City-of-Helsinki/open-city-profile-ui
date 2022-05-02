import to from 'await-to-js';

import createHttpPoller, { HttpPoller } from './http-poller';

export type RetryingPollerProps = {
  pollFunction: () => Promise<Response | undefined>;
  pollIntervalInMs?: number;
  maxRetries?: number;
};

export default async function retryPollingUntilSuccessful({
  pollFunction,
  pollIntervalInMs = 1000,
  maxRetries = 10,
}: RetryingPollerProps): Promise<Response> {
  const [err, response] = await to(pollFunction());
  if (!err && response) {
    return Promise.resolve(response);
  }
  let retries = maxRetries;
  let poller: HttpPoller | undefined;
  const removePoller = () => {
    poller && poller.stop();
    poller = undefined;
  };

  return new Promise((resolve, reject) => {
    poller = createHttpPoller({
      pollFunction: async () => pollFunction(),
      onSuccess: successResponse => {
        retries = 0;
        resolve(successResponse);
        return { keepPolling: false };
      },
      onError: () => {
        retries = retries - 1;
        const keepPolling = retries > 0;
        if (!keepPolling) {
          reject(new Error('Max retries reached'));
        }
        return { keepPolling };
      },
      shouldPoll: () => retries > 0,
      pollIntervalInMs,
    });
    poller.start();
  })
    .then(r => Promise.resolve(r as Response))
    .catch(e => Promise.reject(e))
    .finally(() => removePoller());
}
