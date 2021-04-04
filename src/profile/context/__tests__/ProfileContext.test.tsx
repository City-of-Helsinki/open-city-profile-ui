import { cleanup } from '@testing-library/react';
import { act, cleanup as cleanupHooks } from '@testing-library/react-hooks';

import { getMyProfile } from '../../../common/test/myProfileMocking';
import { exposeProfileContext } from '../../../common/test/componentMocking';
import {
  MockedResponse,
  resetApolloMocks,
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
    cleanup();
    cleanupHooks();
    resetApolloMocks();
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
    });
  });
  it('Fetch errors are handled', async () => {
    const responses: MockedResponse[] = [{ errorType: 'graphQLError' }];
    const { result, waitForUpdate } = createTestEnv(responses);
    let context = result.current;
    await act(async () => {
      // first promise is resolved when context.loading changes to true
      const loadingPromise = waitForUpdate();
      context.fetch();
      await loadingPromise;
      // second promise is resolved when context.loading changes to false and error is returned
      const dataLoadedPromise = waitForUpdate();
      await dataLoadedPromise;
      context = result.current;
      expect(context.data).toBeUndefined();
      expect(context.error).toBeDefined();
      expect(context.loading).toEqual(false);
      expect(context.isInitialized).toEqual(true);
      expect(context.isComplete).toEqual(false);
    });
  });
});
