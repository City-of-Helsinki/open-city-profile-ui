import { waitFor } from '@testing-library/react';
import to from 'await-to-js';
import HttpStatusCode from 'http-status-typed';

import retryPollingUntilSuccessful, {
  RetryingPollerProps,
} from '../http-poller-with-promises';
import {
  getHttpPollerMockData,
  enableActualHttpPoller,
  disableActualHttpPoller,
  removeActualHttpPoller,
} from '../__mocks__/http-poller';
import { TestResponse } from './http-poller.test';

describe(`http-poller-with-promises.ts`, () => {
  const pollFunctionMockCallback = vi.fn();
  const successfulResponse: TestResponse = {
    status: HttpStatusCode.OK,
    data: 'success',
  };
  const forbiddenResponse: TestResponse = { status: HttpStatusCode.FORBIDDEN };
  const errorResponse: TestResponse = { status: -1 };
  const responsesWithErrorForbiddenSuccess = [
    errorResponse,
    forbiddenResponse,
    successfulResponse,
  ];
  const pollIntervalInMs = 100;
  let isResolved = false;
  let isRejected = false;

  function createAPoller(
    responses: TestResponse[],
    props?: Partial<RetryingPollerProps>
  ): Promise<Response> {
    const list = [...responses];
    const retryPromise = retryPollingUntilSuccessful({
      pollFunction: async () => {
        pollFunctionMockCallback(Date.now());
        const response = list.shift();
        if (!response || response.status === -1) {
          return Promise.reject(new Error('An error'));
        } else {
          return Promise.resolve(response as Response);
        }
      },
      pollIntervalInMs,
      ...props,
    });
    retryPromise
      .then(() => {
        isResolved = true;
      })
      .catch(() => {
        isRejected = true;
      });
    return retryPromise;
  }
  const mockHttpPoller = getHttpPollerMockData();

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
    mockHttpPoller.start.mockReset();
    mockHttpPoller.stop.mockReset();
    removeActualHttpPoller();
  });
  beforeEach(() => {
    vi.useFakeTimers();
    isResolved = false;
    isRejected = false;
  });
  beforeAll(async () => {
    enableActualHttpPoller(await vi.importActual('../http-poller'));
  });
  afterAll(() => {
    disableActualHttpPoller();
  });
  const advanceOneInterval = async () => {
    vi.advanceTimersByTime(pollIntervalInMs);
  };
  const testCallbackCount = async ({
    assumedCallCount,
    assumedState,
  }: {
    assumedCallCount: number;
    assumedState?: 'resolved' | 'rejected';
  }) => {
    await waitFor(() => {
      expect(pollFunctionMockCallback).toHaveBeenCalledTimes(assumedCallCount);
    });
    expect(isResolved).toEqual(assumedState === 'resolved');
    expect(isRejected).toEqual(assumedState === 'rejected');
  };
  it('First request is done immediately without http-poller. Successful response is returned.', async () => {
    const promise = createAPoller([successfulResponse]);
    await testCallbackCount({
      assumedCallCount: 1,
      assumedState: 'resolved',
    });
    advanceOneInterval();
    advanceOneInterval();
    const response = await promise;
    await testCallbackCount({
      assumedCallCount: 1,
      assumedState: 'resolved',
    });
    expect(pollFunctionMockCallback).toHaveBeenCalledTimes(1);
    expect(mockHttpPoller.start).toHaveBeenCalledTimes(0);
    expect(response).toEqual(successfulResponse);
  });
  it(`If first request fails, http-poller is started.
      Promise is resolved, when request is successful.
      New attempts are not made after that. Successful response is returned.`, async () => {
    const promise = createAPoller(responsesWithErrorForbiddenSuccess);
    await testCallbackCount({
      assumedCallCount: 1,
    });
    advanceOneInterval();
    expect(mockHttpPoller.start).toHaveBeenCalledTimes(1);
    await testCallbackCount({
      assumedCallCount: 2,
    });
    advanceOneInterval();
    await testCallbackCount({
      assumedCallCount: 3,
      assumedState: 'resolved',
    });
    const [err, response] = await to(promise);
    expect(err).toBeNull();
    expect(response).toEqual(successfulResponse);
    expect(pollFunctionMockCallback).toHaveBeenCalledTimes(3);
    expect(mockHttpPoller.stop).toHaveBeenCalledTimes(1);
    advanceOneInterval();
    advanceOneInterval();
    await testCallbackCount({
      assumedCallCount: 3,
      assumedState: 'resolved',
    });
  });
  it(`maxRetries sets maximum number retries.
      When maxRetries is reached, the promise is rejected
      and new attempts are not made after that
      An error is returned.`, async () => {
    const promise = createAPoller(responsesWithErrorForbiddenSuccess, {
      maxRetries: 1,
    });

    await testCallbackCount({
      assumedCallCount: 1,
    });
    advanceOneInterval();
    await testCallbackCount({
      assumedCallCount: 2,
      assumedState: 'rejected',
    });
    advanceOneInterval();
    advanceOneInterval();
    await testCallbackCount({
      assumedCallCount: 2,
      assumedState: 'rejected',
    });
    const [err, result] = await to(promise);
    expect(err).toBeDefined();
    expect(result).toBeUndefined();
    expect(pollFunctionMockCallback).toHaveBeenCalledTimes(2);
    expect(mockHttpPoller.start).toHaveBeenCalledTimes(1);
    expect(mockHttpPoller.stop).toHaveBeenCalledTimes(1);
  });
  it('pollIntervalInMs sets the delay between attempts', async () => {
    const promise = createAPoller(responsesWithErrorForbiddenSuccess, {
      pollIntervalInMs: pollIntervalInMs * 4,
    });

    await testCallbackCount({
      assumedCallCount: 1,
    });
    advanceOneInterval();
    advanceOneInterval();
    advanceOneInterval();
    await testCallbackCount({
      assumedCallCount: 1,
    });
    advanceOneInterval();
    await testCallbackCount({
      assumedCallCount: 2,
    });
    advanceOneInterval();
    advanceOneInterval();
    advanceOneInterval();
    await testCallbackCount({
      assumedCallCount: 2,
    });
    advanceOneInterval();
    await promise;
    await testCallbackCount({
      assumedCallCount: 3,
      assumedState: 'resolved',
    });
    expect(pollFunctionMockCallback).toHaveBeenCalledTimes(3);
    expect(mockHttpPoller.start).toHaveBeenCalledTimes(1);
    expect(mockHttpPoller.stop).toHaveBeenCalledTimes(1);
  });
});
