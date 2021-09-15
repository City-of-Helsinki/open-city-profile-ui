import HttpStatusCode from 'http-status-typed';

import createHttpPoller, { HttpPoller } from '../http-poller';

type TestProps = {
  requestResponse: {
    status: HttpStatusCode.OK | HttpStatusCode.FORBIDDEN | -1;
  };
  onErrorReturnValue: { keepPolling: boolean };
  shouldPollReturnValue: boolean;
  maxPollCount: number;
};

jest.unmock('../http-poller');

describe(`http-poller`, () => {
  const pollFunctionMockCallback = jest.fn();
  const onErrorMockCallback = jest.fn();
  const shouldPollMockCallback = jest.fn();
  const loadCallTracker = jest.fn();
  const intervalInMs = 200;
  let poller: HttpPoller;
  const pollerDefaultTestProps: TestProps = {
    requestResponse: { status: HttpStatusCode.OK },
    onErrorReturnValue: { keepPolling: true },
    shouldPollReturnValue: true,
    maxPollCount: 0,
  };
  function createPoller(responses: TestProps): HttpPoller {
    let pollCount = 0;
    return createHttpPoller({
      pollFunction: async () => {
        pollFunctionMockCallback();
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            loadCallTracker();
            if (responses.requestResponse.status === -1) {
              reject(new Error('An error'));
            } else {
              resolve(responses.requestResponse as Response);
            }
          }, intervalInMs * 2);
        });
      },
      onError: returnedHttpStatus => {
        onErrorMockCallback(returnedHttpStatus);
        return responses.onErrorReturnValue;
      },
      shouldPoll: () => {
        shouldPollMockCallback();
        if (responses.maxPollCount > 0 && pollCount >= responses.maxPollCount) {
          return false;
        }
        pollCount += 1;
        return responses.shouldPollReturnValue;
      },
      pollIntervalInMs: intervalInMs,
    });
  }
  const advanceOneInterval = async () => {
    jest.advanceTimersByTime(intervalInMs + 1);
  };
  const advanceToTimerEnd = async () => {
    await advanceOneInterval();
  };
  const advanceFromTimerEndToLoadEnd = async () => {
    await advanceOneInterval();
    await advanceOneInterval();
    // https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function
    await new Promise(resolve => setImmediate(resolve));
  };
  const advanceFromStartTimerToLoadEnd = async () => {
    await advanceToTimerEnd();
    await advanceFromTimerEndToLoadEnd();
  };
  const advanceFromTimerEndToNextTimerEnd = async () => {
    await advanceFromTimerEndToLoadEnd();
    await advanceToTimerEnd();
  };
  afterEach(() => {
    poller.stop();
    jest.resetAllMocks();
    jest.useRealTimers();
  });
  beforeEach(() => {
    jest.useFakeTimers();
  });
  describe('Calling start() starts the timer and when timer ends ', () => {
    it('the pollFunction and shouldPoll have been called continuously', async () => {
      poller = createPoller({
        ...pollerDefaultTestProps,
      });
      poller.start();
      expect(shouldPollMockCallback).not.toBeCalled();
      expect(pollFunctionMockCallback).not.toBeCalled();
      expect(onErrorMockCallback).not.toBeCalled();
      await advanceToTimerEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(1);
      await advanceFromTimerEndToNextTimerEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(2);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(2);
      expect(loadCallTracker).toHaveBeenCalledTimes(1);
      expect(onErrorMockCallback).toHaveBeenCalledTimes(0);
    });
    it('the pollFunction should not be called if shouldPoll returns false', async () => {
      poller = createPoller({
        ...pollerDefaultTestProps,
        shouldPollReturnValue: false,
      });
      poller.start();
      await advanceToTimerEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(0);
      await advanceToTimerEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(2);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(0);
    });
    it(`the onError is called with responseStatus when response status is not httpStatus.OK (200). 
        Polling continues when onError returns {keepPolling : true}`, async () => {
      poller = createPoller({
        ...pollerDefaultTestProps,
        requestResponse: { status: HttpStatusCode.FORBIDDEN },
      });
      poller.start();
      await advanceFromStartTimerToLoadEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(onErrorMockCallback).toHaveBeenCalledTimes(1);
      expect(onErrorMockCallback).toBeCalledWith(HttpStatusCode.FORBIDDEN);
      await advanceToTimerEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(2);
    });
    it(`the onError is called also on network error 
        and polling stops after error when onError returns {keepPolling : false}`, async () => {
      poller = createPoller({
        ...pollerDefaultTestProps,
        requestResponse: { status: -1 },
        onErrorReturnValue: { keepPolling: false },
      });
      poller.start();
      await advanceFromStartTimerToLoadEnd();
      expect(onErrorMockCallback).toHaveBeenCalledTimes(1);
      expect(onErrorMockCallback).toBeCalledWith(undefined);
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(1);
      await advanceToTimerEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(1);
    });
    it('Polling never starts if poller.stop is called', async () => {
      poller = createPoller({
        ...pollerDefaultTestProps,
      });
      poller.start();
      poller.stop();
      await advanceFromStartTimerToLoadEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(0);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(0);
      expect(loadCallTracker).toHaveBeenCalledTimes(0);
    });
    it('Response is ignored if poller.stop is called after load has started', async () => {
      poller = createPoller({
        ...pollerDefaultTestProps,
        requestResponse: { status: HttpStatusCode.FORBIDDEN },
      });
      poller.start();
      await advanceToTimerEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(1);
      poller.stop();
      await advanceFromTimerEndToLoadEnd();
      expect(loadCallTracker).toHaveBeenCalledTimes(1);
      expect(onErrorMockCallback).toHaveBeenCalledTimes(0);
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(1);
    });
    it('Multiple starts do not start multiple requests', async () => {
      poller = createPoller({
        ...pollerDefaultTestProps,
        requestResponse: { status: HttpStatusCode.FORBIDDEN },
      });
      poller.start();
      poller.start();
      poller.start();
      await advanceToTimerEnd();
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(1);
      poller.stop();
      await advanceFromTimerEndToLoadEnd();
      expect(onErrorMockCallback).toHaveBeenCalledTimes(0);
      expect(shouldPollMockCallback).toHaveBeenCalledTimes(1);
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(1);
      expect(loadCallTracker).toHaveBeenCalledTimes(1);
    });
  });
});
