import React from 'react';
import { act, waitFor } from '@testing-library/react';
/*
import { renderComponentWithMocksAndContexts } from '../../../../common/test/testingLibraryTools';
import WithAuthCheck, { WithAuthCheckChildProps } from '../WithAuthCheck';
import { MockedResponse } from '../../../../common/test/MockApolloClientProvider';
import { mockUserCreator } from '../../../../common/test/userMocking';
import authService from '../../../../auth/authService';
import { getLinkRedirectState } from '../../../hooks/useHistoryListener';

const mockedHistory = {
  push: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    useHistory: vi.fn().mockImplementation(() => mockedHistory),
  };
});

describe('<WithAuthCheck /> ', () => {
  const mockedUser = mockUserCreator();
  const timeoutInMs = 60;

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

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    mockedHistory.push.mockReset();
    // to end all possibly existing timeouts
    vi.advanceTimersByTime(timeoutInMs * 10);
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('renders a load-indicator while waiting for user data.', async () => {
    vi.spyOn(authService, 'getAuthenticatedUser').mockRejectedValue(null);
    await act(async () => {
      const { waitForElement } = await renderTestSuite();
      await waitForElement({ testId: 'load-indicator' });
    });
  });

  it('redirects to /login when user is not authenticated.', async () => {
    vi.spyOn(authService, 'getAuthenticatedUser').mockRejectedValue(null);
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
    vi.spyOn(authService, 'getAuthenticatedUser').mockResolvedValue(mockedUser);
    await act(async () => {
      const { waitForElement, getElement } = await renderTestSuite();
      await waitForElement({ testId: authenticatedUserTestId });
      const userAccessToken = getElement({ testId: authenticatedUserTestId })
        ?.innerHTML;
      expect(userAccessToken).toBe(mockedUser.access_token);
    });
  });
});

*/
