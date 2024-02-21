import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { User } from 'oidc-client';

import {
  mockUserCreator,
  MockedUserOverrides,
} from '../../common/test/userMocking';
import authService from '../authService';
import useProfile, { Profile } from '../useProfile';

type Status = 'loading' | 'error' | 'loaded';
type DataGetters = {
  getInfo: () => Status;
  getProfile: () => Profile | null;
  hasCalledGetUser: () => boolean;
  getMockedUserData: () => User;
};

describe('useProfile', () => {
  const loadingStatus: Status = 'loading';
  const loadedStatus: Status = 'loaded';
  const errorStatus: Status = 'error';
  const statusIndicatorElementId = 'status-indicator';
  const profileElementId = 'profile';
  const noProfile = { noProfile: true };
  const TestProfileComponent = ({
    callCounter,
  }: {
    callCounter: () => number;
  }) => {
    const hasLoadStarted = callCounter() > 0;
    const { profile, loading, error } = useProfile();
    const isFinished = hasLoadStarted && loading === false;

    if (error) {
      return <span id={statusIndicatorElementId}>{errorStatus}</span>;
    }
    if (!isFinished) {
      return <span id={statusIndicatorElementId}>{loadingStatus}</span>;
    }
    return (
      <div>
        <span id={statusIndicatorElementId}>{loadedStatus}</span>
        <span id={profileElementId}>
          {JSON.stringify(profile ? profile : noProfile)}
        </span>
      </div>
    );
  };
  const renderTestComponent = (
    overrides?: MockedUserOverrides,
    error = false
  ): DataGetters => {
    const userData = mockUserCreator(overrides);
    const mockedGetUser = vi.spyOn(authService, 'getUser');

    if (error) {
      mockedGetUser.mockRejectedValueOnce(null);
    } else {
      mockedGetUser.mockResolvedValueOnce(userData);
    }
    const result = render(
      <TestProfileComponent
        callCounter={() => mockedGetUser.mock.calls.length}
      />
    );
    const { container } = result;
    const getElementById = (id: string) =>
      container.querySelector(`#${id}`) as HTMLElement;
    return {
      getInfo: () =>
        getElementById(statusIndicatorElementId).innerHTML as Status,
      getProfile: () => {
        const data = getElementById(profileElementId).innerHTML;
        return JSON.parse(data);
      },
      hasCalledGetUser: () => mockedGetUser.mock.calls.length > 0,
      getMockedUserData: () => userData,
    };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the profile which the authService.getUser() provides where amr is always an array', async () => {
    const amr = 'string-arm';
    const {
      getInfo,
      getProfile,
      getMockedUserData,
      hasCalledGetUser,
    } = renderTestComponent({
      profileOverrides: { amr },
    });
    const userData = getMockedUserData();
    await waitFor(() => expect(getInfo()).toEqual(loadedStatus));
    expect(hasCalledGetUser()).toBeTruthy();
    const profileWithConvertedAmr = {
      ...userData.profile,
      amr: [amr],
    };
    expect(getProfile()).toEqual(profileWithConvertedAmr);
  });

  it('should provide no profile if it has expired', async () => {
    const { getInfo, getProfile } = renderTestComponent({
      userOverrides: ({
        expired: true,
      } as unknown) as Partial<User>,
    });
    await waitFor(() => expect(getInfo()).toEqual(loadedStatus));
    expect(getProfile()).toEqual(noProfile);
  });

  it('should provide no profile if user.expired is undefined', async () => {
    const { getInfo, getProfile } = renderTestComponent({
      userOverrides: ({
        expired: undefined,
      } as unknown) as Partial<User>,
    });
    await waitFor(() => expect(getInfo()).toEqual(loadedStatus));
    expect(getProfile()).toEqual(noProfile);
  });

  it('should return an empty array if arm is undefined', async () => {
    const { getInfo, getProfile, getMockedUserData } = renderTestComponent({
      profileOverrides: { amr: undefined },
    });
    const userData = getMockedUserData();
    await waitFor(() => expect(getInfo()).toEqual(loadedStatus));
    const profileWithConvertedAmr = {
      ...userData.profile,
      amr: [],
    };
    expect(getProfile()).toEqual(profileWithConvertedAmr);
  });

  it('should return error when authService.getUser() fails', async () => {
    const { getInfo } = renderTestComponent(undefined, true);
    await waitFor(() => expect(getInfo()).toEqual(errorStatus));
  });
});
