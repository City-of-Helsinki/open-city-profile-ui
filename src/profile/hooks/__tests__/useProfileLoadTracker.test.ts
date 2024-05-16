import { waitFor } from '@testing-library/react';
import { RenderHookResult, act } from '@testing-library/react-hooks';
import { ApolloError } from '@apollo/client';

import {
  RenderHookResultsChildren,
  cleanComponentMocks,
} from '../../../common/test/testingLibraryTools';
import {
  createApolloErrorWithAllowedPermissionError,
  MockedResponse,
} from '../../../common/test/MockApolloClientProvider';
import { getMyProfile } from '../../../common/test/myProfileMocking';
import { ProfileRoot } from '../../../graphql/typings';
import {
  useProfileLoadTracker,
  useProfileLoaderHookReturnType,
} from '../useProfileLoadTracker';
import { exposeHook } from '../../../common/test/exposeHooksForTesting';
import * as profileQueryModule from '../useProfileQuery';

type RenderResult = RenderHookResult<
  RenderHookResultsChildren,
  useProfileLoaderHookReturnType
>;

type UseProfileQueryReturnType = ReturnType<
  typeof profileQueryModule['useProfileQuery']
>;

describe('useProfileLoader.ts ', () => {
  let mockUseProfileQueryResult: UseProfileQueryReturnType;
  const successfulProfileLoadData = { data: getMyProfile() };
  const fetchProfileMock = vi
    .fn()
    .mockImplementation(async () => Promise.resolve());
  const refetchProfileMock = vi
    .fn()
    .mockImplementation(async () => Promise.resolve(successfulProfileLoadData));

  const timeoutInMs = 60;
  const advanceTimers = () => vi.advanceTimersByTime(timeoutInMs + 1);

  // Mocking the useProfile hook. It is used by ProfileContext, which is used by useProfileLoadTracker
  // Results from fetch() and refetch() are not used, only changes in the profile context.
  // So those mocked functions can return undefined - except refetch must return profile data (typescript requirement)
  const createUseProfileQueryResultMock = (): UseProfileQueryReturnType => ({
    data: undefined,
    loading: false,
    error: undefined,
    fetch: fetchProfileMock,
    refetch: refetchProfileMock,
  });

  // Update mockUseProfileQueryResult returned from useProfile hook (mocked)
  const updateMockUseProfileQueryResult = (
    props: Partial<UseProfileQueryReturnType>
  ) => {
    mockUseProfileQueryResult = {
      ...mockUseProfileQueryResult,
      ...props,
    };
  };

  // Not setting this is beforeEach, because act() do not work with it.
  const initTests = async (): Promise<RenderResult> => {
    const renderHookResult = exposeHook<useProfileLoaderHookReturnType>(
      () => ({} as MockedResponse),
      () => useProfileLoadTracker(),
      false
    );
    return Promise.resolve(renderHookResult);
  };

  // Better to simulate actual load process
  // and not skip the loading phase.
  // First { loading: true } is set
  // and data / error after that
  const mockProfileLoadProcess = ({
    data,
    error,
  }: {
    data?: ProfileRoot;
    error?: ApolloError;
  }) => {
    const loadingPromise = new Promise(resolve => {
      setTimeout(() => {
        updateMockUseProfileQueryResult({ loading: true });
        resolve(true);
      }, timeoutInMs);
    });
    const dataIsSetPromise = new Promise(resolve => {
      setTimeout(() => {
        updateMockUseProfileQueryResult({
          data,
          error,
          loading: false,
        });
        resolve(true);
      }, timeoutInMs * 2);
    });

    return {
      loadingPromise,
      dataIsSetPromise,
    };
  };

  const waitForProfileLoadToEnd = async (renderHookResult: RenderResult) =>
    waitFor(() => {
      const currentHookProps = renderHookResult.result.current;

      if (currentHookProps.isProfileLoadComplete() === false) {
        advanceTimers();
        renderHookResult.rerender();
        throw new Error('Profile load is not complete');
      }
    });

  // Function for advancing straight to point where
  // profile loading is complete (success / failure)
  const proceedToProfileLoadCompleteState = async ({
    loadSuccess,
    profileExist,
    addAllowedGraphQLError,
  }: {
    loadSuccess: boolean;
    profileExist: boolean;
    addAllowedGraphQLError: boolean;
  }) => {
    const renderHookResult = await initTests();

    const result = profileExist
      ? { data: loadSuccess ? getMyProfile() : undefined }
      : { data: { myProfile: null } };

    const errorObj = addAllowedGraphQLError
      ? createApolloErrorWithAllowedPermissionError()
      : (({} as unknown) as ApolloError);

    const error = loadSuccess ? undefined : errorObj;

    mockProfileLoadProcess({ ...result, error });

    await waitForProfileLoadToEnd(renderHookResult);

    return { renderHookResult };
  };

  beforeEach(() => {
    mockUseProfileQueryResult = createUseProfileQueryResultMock();

    vi.spyOn(profileQueryModule, 'useProfileQuery').mockImplementation(
      () => mockUseProfileQueryResult
    );

    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanComponentMocks();

    vi.resetAllMocks();
    // to end all possibly existing timeouts
    vi.advanceTimersByTime(timeoutInMs * 10);
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('useProfileLoader() hook tracks changes in profile context.', () => {
    it(`Profile should not be loaded at all, if it is already loaded. In this case
        - hook.isProfileLoadComplete() returns true
        - hook.hasExistingProfile() returns true
        - hook.didProfileLoadFail() returns false`, async () => {
      await act(async () => {
        updateMockUseProfileQueryResult({
          ...successfulProfileLoadData,
          loading: false,
        });

        const renderHookResult = await initTests();
        const currentHookProps = renderHookResult.result.current;
        expect(currentHookProps.isProfileLoadComplete()).toBeTruthy();
        expect(currentHookProps.hasExistingProfile()).toBeTruthy();
        expect(fetchProfileMock).toHaveBeenCalledTimes(0);
      });
    });

    it(`Profile should not be loaded at all, if context has an error. In this case
          - hook.hasExistingProfile() returns false
          - hook.didProfileLoadFail() returns true
          - hook.isProfileLoadComplete() returns true`, async () => {
      await act(async () => {
        updateMockUseProfileQueryResult({
          error: {} as ApolloError,
          loading: false,
        });

        const renderHookResult = await initTests();
        const currentHookProps = renderHookResult.result.current;
        expect(currentHookProps.isProfileLoadComplete()).toBeTruthy();
        expect(currentHookProps.hasExistingProfile()).toBeFalsy();
        expect(fetchProfileMock).toHaveBeenCalledTimes(0);
      });
    });

    // it(`When profile load is successful and profile exists
    //       - hook.hasExistingProfile() returns true
    //       - hook.didProfileLoadFail() returns false
    //       - hook.isProfileLoadComplete() returns true.
    //       Response can include an allowed graphQL error.`, async () => {
    //   await act(async () => {
    //     const { renderHookResult } = await proceedToProfileLoadCompleteState({
    //       loadSuccess: true,
    //       profileExist: true,
    //       addAllowedGraphQLError: true,
    //     });

    //     const currentHookProps = renderHookResult.result.current;

    //     expect(currentHookProps.hasExistingProfile()).toBeTruthy();
    //     expect(currentHookProps.didProfileLoadFail()).toBeFalsy();
    //     expect(currentHookProps.isProfileLoadComplete()).toBeTruthy();
    //     expect(fetchProfileMock).toHaveBeenCalledTimes(1);
    //   });
    // });

    // it(`When profile load is successful, but profile does not exist,
    //         - hook.hasExistingProfile() returns false
    //         - hook.didProfileLoadFail() returns false
    //         - hook.isProfileLoadComplete() returns true`, async () => {
    //   await act(async () => {
    //     const { renderHookResult } = await proceedToProfileLoadCompleteState({
    //       loadSuccess: true,
    //       profileExist: false,
    //       addAllowedGraphQLError: false,
    //     });
    //     const currentHookProps = renderHookResult.result.current;
    //     expect(currentHookProps.hasExistingProfile()).toBeFalsy();
    //     expect(currentHookProps.didProfileLoadFail()).toBeFalsy();
    //     expect(currentHookProps.isProfileLoadComplete()).toBeTruthy();
    //     expect(fetchProfileMock).toHaveBeenCalledTimes(1);
    //   });
    // });

    // it(`When profile load fails
    //         - hook.hasExistingProfile() returns false
    //         - hook.didProfileLoadFail() returns true
    //         - hook.isProfileLoadComplete() returns true`, async () => {
    //   await act(async () => {
    //     const { renderHookResult } = await proceedToProfileLoadCompleteState({
    //       loadSuccess: false,
    //       profileExist: true,
    //       addAllowedGraphQLError: false,
    //     });
    //     const currentHookProps = renderHookResult.result.current;
    //     expect(currentHookProps.isProfileLoadComplete()).toBeTruthy();
    //     expect(currentHookProps.didProfileLoadFail()).toBeTruthy();
    //     expect(currentHookProps.hasExistingProfile()).toBeFalsy();
    //     expect(fetchProfileMock).toHaveBeenCalledTimes(1);
    //   });
    // });

    // it(`Hook provides a reloadProfile() function for refetching profile when
    //         - load fails
    //         - profile is fetched after it is created for first time.`, async () => {
    //   await act(async () => {
    //     const { renderHookResult } = await proceedToProfileLoadCompleteState({
    //       loadSuccess: false,
    //       profileExist: true,
    //       addAllowedGraphQLError: false,
    //     });
    //     const currentHookProps = renderHookResult.result.current;
    //     expect(currentHookProps.didProfileLoadFail()).toBeTruthy();
    //     expect(currentHookProps.hasExistingProfile()).toBeFalsy();
    //     updateMockUseProfileQueryResult({
    //       error: undefined,
    //       loading: true,
    //       data: undefined,
    //     });
    //     mockProfileLoadProcess({
    //       ...successfulProfileLoadData,
    //     });
    //     currentHookProps.reloadProfile();

    //     await waitForProfileLoadToEnd(renderHookResult);
    //     const updatedHookProps = renderHookResult.result.current;
    //     expect(updatedHookProps.didProfileLoadFail()).toBeFalsy();
    //     expect(updatedHookProps.hasExistingProfile()).toBeTruthy();

    //     expect(fetchProfileMock).toHaveBeenCalledTimes(1);
    //     expect(refetchProfileMock).toHaveBeenCalledTimes(1);
    //   });
    // });

    // it('Hook.hasExistingProfile() throws, when used before profile load is complete', async () => {
    //   await act(async () => {
    //     const renderHookResult = await initTests();
    //     const currentHookProps = renderHookResult.result.current;
    //     expect(() => currentHookProps.hasExistingProfile()).toThrow();
    //     mockProfileLoadProcess(successfulProfileLoadData);
    //     await waitForProfileLoadToEnd(renderHookResult);
    //     expect(() => currentHookProps.hasExistingProfile()).not.toThrow();
    //   });
    // });
  });
});
