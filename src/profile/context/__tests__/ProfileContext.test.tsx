import { waitFor } from '@testing-library/react';
import { act } from '@testing-library/react-hooks';

import { getMyProfile } from '../../../common/test/myProfileMocking';
import {
  cleanComponentMocks,
  exposeProfileContext,
} from '../../../common/test/componentMocking';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../common/test/MockApolloClientProvider';
import { ProfileData } from '../../../graphql/typings';

describe('ProfileContext', () => {
  function createTestEnv(responses: MockedResponse[]) {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return exposeProfileContext(responseProvider);
  }

  afterEach(() => {
    cleanComponentMocks();
  });

  it('should have no data before fetch is called and all trackers are "false" ', async () => {
    const { result } = createTestEnv([]);
    const context = result.current;
    expect(context.data).toBeUndefined();
    expect(context.loading).toEqual(false);
    expect(context.isInitialized).toEqual(false);
    expect(context.isComplete).toEqual(false);
  });

  it("after fetch(), context indicates 'loading' state and data updates when fetch is finished", async () => {
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
    ];
    const { result, waitForUpdate } = createTestEnv(responses);
    let context = result.current;
    await act(async () => {
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
    });
  });
  it('Fetch errors are handled and listeners triggered and disposed', async () => {
    const responses: MockedResponse[] = [
      { errorType: 'graphQLError' },
      { errorType: 'networkError' },
    ];
    const { result, waitForErrorChange } = createTestEnv(responses);
    let context = result.current;
    const errorListener = jest.fn();
    const errorListener2 = jest.fn();
    await act(async () => {
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
      await waitFor(() => {
        expect(errorListener.mock.calls.length).toEqual(1);
        expect(errorListener2.mock.calls.length).toEqual(1);
      });
      listenerDisposer();
      const secondErrorPromise = waitForErrorChange();
      context.refetch();
      await secondErrorPromise;
      await waitFor(() => {
        expect(errorListener2.mock.calls.length).toEqual(2);
      });
      expect(errorListener.mock.calls.length).toEqual(1);
    });
  });
});
