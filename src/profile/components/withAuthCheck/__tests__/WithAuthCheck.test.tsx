import React from 'react';
import { act, waitFor } from '@testing-library/react';
import { User } from 'oidc-client';

import { renderComponentWithMocksAndContexts } from '../../../../common/test/testingLibraryTools';
import WithAuthCheck, { WithAuthCheckChildProps } from '../WithAuthCheck';
import { MockedResponse } from '../../../../common/test/MockApolloClientProvider';
import { mockUserCreator } from '../../../../common/test/userMocking';
import authService from '../../../../auth/authService';
import { getLinkRedirectState } from '../../../hooks/useHistoryListener';

const mockedHistory = {
  push: jest.fn(),
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn().mockImplementation(() => mockedHistory),
}));

describe('<WithAuthCheck /> ', () => {
  const mockedUser = mockUserCreator();
  const timeoutInMs = 60;
  const getAuthenticatedUserMock = jest.fn();
  const authenticatedUserTestId = 'authenticated-user';

  const TestComponent = (props: WithAuthCheckChildProps) => (
    <div data-testid={authenticatedUserTestId}>{props.user.access_token}</div>
  );
  const WithAuthCheckAndTestComponent = () => (
    <WithAuthCheck AuthenticatedComponent={TestComponent} />
  );
  const renderTestSuite = () =>
    renderComponentWithMocksAndContexts(
      () => ({} as MockedResponse),
      <WithAuthCheckAndTestComponent />
    );

  const mockAuthenticationProcess = (success = true) => {
    const authPromise: Promise<User | null> = new Promise((resolve, reject) => {
      setTimeout(() => {
        success ? resolve(mockedUser) : reject(null);
      }, timeoutInMs);
    });
    jest.spyOn(authService, 'getAuthenticatedUser').mockImplementation(() => {
      getAuthenticatedUserMock();
      return authPromise;
    });
    return authPromise;
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    getAuthenticatedUserMock.mockReset();
    mockedHistory.push.mockReset();
    // to end all possibly existing timeouts
    jest.advanceTimersByTime(timeoutInMs * 10);
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders a load-indicator while waiting for user data.', async () => {
    mockAuthenticationProcess(false);
    await act(async () => {
      const { waitForElement } = await renderTestSuite();
      await waitForElement({ testId: 'load-indicator' });
    });
  });

  it('redirects to /login when user is not authenticated.', async () => {
    mockAuthenticationProcess(false);
    await act(async () => {
      await renderTestSuite();
      await waitFor(() => {
        expect(mockedHistory.push).toHaveBeenCalledTimes(1);
        expect(mockedHistory.push).toHaveBeenLastCalledWith(
          '/login',
          getLinkRedirectState()
        );
      });
    });
  });
  it('renders the child component when user is authenticated. User is passed as a prop.', async () => {
    mockAuthenticationProcess(true);
    await act(async () => {
      const { waitForElement, getElement } = await renderTestSuite();
      await waitForElement({ testId: authenticatedUserTestId });
      const userAccessToken = getElement({ testId: authenticatedUserTestId })
        ?.innerHTML;
      expect(userAccessToken).toBe(mockedUser.access_token);
    });
  });
});
