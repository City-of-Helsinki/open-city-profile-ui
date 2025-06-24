import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { User } from 'oidc-client-ts';
import * as hdsReact from 'hds-react';

import {
  mockUserCreator,
  MockedUserOverrides,
} from '../../common/test/userMocking';
import useProfile, { Profile } from '../useProfile';
import TestLoginProvider from '../../common/test/TestLoginProvider';

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
    const { profile, loading, error } = useProfile();
    const hasLoadStarted = callCounter() > 0;
    const isFinished = hasLoadStarted && loading === false;
    let status: Status = loadedStatus;

    if (error) {
      status = errorStatus;
    } else if (!isFinished) {
      status = loadingStatus;
    }

    return (
      <div>
        <span id={statusIndicatorElementId}>{status}</span>
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
    const mockedGetUser = vi
      .fn()
      .mockImplementation(() => (error ? null : userData));

    vi.spyOn(hdsReact, 'useOidcClient').mockReturnValue({
      getUser: mockedGetUser,
      getAmr: vi.fn(),
      getState: vi.fn(),
      getToken: vi.fn(),
      getUserManager: vi.fn(),
      handleCallback: vi.fn(),
      isAuthenticated: vi.fn(),
      isRenewing: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      renewUser: vi.fn(),
      connect: vi.fn(),
      namespace: '',
    });

    const result = render(
      <TestLoginProvider>
        <TestProfileComponent
          callCounter={() => mockedGetUser.mock.calls.length}
        />
      </TestLoginProvider>
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

    const { getInfo, getProfile, getMockedUserData, hasCalledGetUser } =
      renderTestComponent({
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
    const { getProfile } = renderTestComponent({
      userOverrides: {
        expired: true,
      } as unknown as Partial<User>,
    });
    await waitFor(() => expect(getProfile()).toEqual(noProfile));
  });

  it('should provide no profile if user.expired is undefined', async () => {
    const { getInfo, getProfile } = renderTestComponent({
      userOverrides: {
        expired: undefined,
      } as unknown as Partial<User>,
    });
    await waitFor(() => getInfo());
    await waitFor(() => expect(getProfile()).toEqual(noProfile));
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
