import to from 'await-to-js';
import HttpStatusCode from 'http-status-typed';

export type HttpPoller = {
  start: () => void;
  stop: () => void;
};

export type HttpPollerProps = {
  pollFunction: () => Promise<Response | undefined>;
  shouldPoll: () => boolean;
  onError: (returnedHttpStatus?: number) => { keepPolling: boolean };
  pollIntervalInMs?: number;
};

const defaultPollIntervalInMs = 60000;

export default function createHttpPoller({
  pollFunction,
  shouldPoll,
  onError,
  pollIntervalInMs = defaultPollIntervalInMs,
}: HttpPollerProps): HttpPoller {
  let isPolling = false;
  let isForceStopped = false;
  let pollTimeoutId: ReturnType<typeof setTimeout> | undefined;

  const load = async (): Promise<[Error | null, Response | undefined]> => {
    isPolling = true;
    const result = await to(pollFunction());
    isPolling = false;
    return result;
  };

  const shouldCallPollFunction = (): boolean => {
    if (isPolling) {
      return false;
    }
    return shouldPoll();
  };

  const startTimer = () => {
    if (pollTimeoutId) {
      clearTimeout(pollTimeoutId);
    }
    pollTimeoutId = setTimeout(() => {
      pollTimeoutId = undefined;
      if (!shouldCallPollFunction()) {
        startTimer();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      pollAndHandleResult();
    }, pollIntervalInMs);
  };

  const pollAndHandleResult = async (): Promise<void> => {
    const [err, data] = await load();
    if (isForceStopped) {
      return;
    }
    const responseStatus = data && data.status;
    const isErrorResponse = responseStatus !== HttpStatusCode.OK;
    if ((!err && !isErrorResponse) || onError(responseStatus).keepPolling) {
      startTimer();
    }
  };

  const stop = () => {
    if (pollTimeoutId) {
      clearTimeout(pollTimeoutId);
      pollTimeoutId = undefined;
    }
    isForceStopped = true;
  };

  return {
    start: () => {
      isForceStopped = false;
      startTimer();
    },
    stop,
  };
}
