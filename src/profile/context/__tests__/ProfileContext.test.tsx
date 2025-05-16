import { waitFor } from '@testing-library/react';

import { getMyProfile } from '../../../common/test/myProfileMocking';
import { cleanComponentMocks } from '../../../common/test/testingLibraryTools';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../common/test/MockApolloClientProvider';
import { ProfileData } from '../../../graphql/typings';
import { exposeProfileContext } from '../../../common/test/exposeHooksForTesting';

const mockSentyCaptureException = vi.fn();

vi.mock('@sentry/react', async () => {
  const module = await vi.importActual('@sentry/react');

  return {
    ...module,
    captureException: () => {
      mockSentyCaptureException();
    },
  };
});

describe('ProfileContext', () => {
  function createTestEnv(responses: MockedResponse[]) {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return exposeProfileContext(responseProvider);
  }

  afterEach(() => {
    mockSentyCaptureException.mockReset();
    cleanComponentMocks();
  });

  it('should have no data before fetch is called and all trackers are "false" ', async () => {
    const { result } = createTestEnv([]);
    const context = result.current;
    expect(context.data).toBeUndefined();
    expect(context.loading).toEqual(false);
    expect(context.isInitialized).toEqual(false);
    expect(context.isComplete).toEqual(false);
    expect(context.getProfile()).toBeNull();
  });

  it("after fetch(), context indicates 'loading' state and data updates when fetch is finished", async () => {
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
    ];
    const { result, waitForUpdate } = createTestEnv(responses);
    let context = result.current;

    const loadingPromise = waitForUpdate();
    context.fetch();
    await loadingPromise;
    context = result.current;
    expect(context.data).toBeUndefined();
    expect(context.loading).toEqual(true);
    expect(context.isInitialized).toEqual(true);
    expect(context.isComplete).toEqual(false);

    const dataLoadedPromise = waitForUpdate();
    await dataLoadedPromise;
    context = result.current;
    expect(context.data).toBeDefined();
    expect(context.loading).toEqual(false);
    expect(context.isInitialized).toEqual(true);
    expect(context.isComplete).toEqual(true);
    expect(context.data?.myProfile?.firstName).toEqual('Teemu');
    expect(context.getName()).toEqual('Teemu Testaaja');
    expect(context.getName(true)).toEqual('Teme');
    expect(context.getProfile()).toEqual(getMyProfile());
  });
  it("load is successful also when user's profile does not exist", async () => {
    const responses: MockedResponse[] = [{ profileData: null }];
    const { result, waitForUpdate } = createTestEnv(responses);
    let context = result.current;

    const loadingPromise = waitForUpdate();
    context.fetch();
    await loadingPromise;
    context = result.current;
    const dataLoadedPromise = waitForUpdate();
    await dataLoadedPromise;
    context = result.current;
    expect(context.data).toEqual({ myProfile: null });
    expect(context.isComplete).toEqual(true);
    expect(context.getProfile()).toBeNull();
  });
  it('Fetch errors are handled and listeners triggered and disposed. Error is reported to Sentry', async () => {
    const responses: MockedResponse[] = [
      { errorType: 'graphQLError' },
      { errorType: 'networkError' },
    ];
    const { result, waitForErrorChange } = createTestEnv(responses);
    let context = result.current;
    const errorListener = vi.fn();
    const errorListener2 = vi.fn();

    // first promise is resolved when context.loading changes to true
    const errorPromise = waitForErrorChange();
    const listenerDisposer = context.addErrorListener(errorListener);
    context.addErrorListener(errorListener2);
    context.fetch();
    await errorPromise;
    context = result.current;
    expect(context.data).toBeUndefined();
    expect(context.error).toBeDefined();
    expect(context.loading).toEqual(false);
    expect(context.isInitialized).toEqual(true);
    expect(context.isComplete).toEqual(false);
    expect(context.getProfile()).toBeNull();
    await waitFor(() => {
      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(errorListener2).toHaveBeenCalledTimes(1);
    });
    listenerDisposer();
    const secondErrorPromise = waitForErrorChange();
    context.refetch();
    await secondErrorPromise;
    await waitFor(() => {
      expect(errorListener2).toHaveBeenCalledTimes(2);
    });
    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(mockSentyCaptureException).toHaveBeenCalledTimes(2);
  });
});
