import React from 'react';
import { User } from 'oidc-client';
import { act, cleanup } from '@testing-library/react';
import { Route, Switch } from 'react-router';

import { getMyProfile } from '../../../../common/test/myProfileMocking';
import { renderComponentWithMocksAndContexts } from '../../../../common/test/testingLibraryTools';
import { ProfileData } from '../../../../graphql/typings';
import Profile from '../Profile';
import {
  MockedResponse,
  resetApolloMocks,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import authService from '../../../../auth/authService';
describe('<Profile />', () => {
  const RouteOutputAsHTML = () => (
    <div data-testid="context-as-html">
      <Switch>
        <Route path="/login">
          <div data-testid="location-is-login">/login</div>
        </Route>
      </Switch>
    </div>
  );

  const renderTestSuite = (responses: MockedResponse[]) => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <React.Fragment>
        <Profile />
        <RouteOutputAsHTML />
      </React.Fragment>
    );
  };

  const mockUser = (): void => {
    const user = ({ profile: { name: 'Mock User' } } as unknown) as User;
    const userManager = authService.userManager;
    jest.spyOn(userManager, 'getUser').mockResolvedValueOnce(user);
  };

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
    resetApolloMocks();
  });

  it('should re-route to /login when user is not authenticated', async () => {
    const { waitForElement } = await renderTestSuite([]);
    await waitForElement({ testId: 'location-is-login' });
  });

  it('should render load indicator and then CreateProfile when profile does not exist', async () => {
    // using 'updatedProfileData' or otherwise profileData is considered to exist.
    const responses: MockedResponse[] = [
      { updatedProfileData: ({ id: null } as unknown) as ProfileData },
    ];
    mockUser();
    await act(async () => {
      const { waitForElement, getElement } = await renderTestSuite(responses);
      getElement({ testId: 'load-indicator' });
      await waitForElement({ testId: 'create-profile-heading' });
    });
  });

  it('should render load indicator and then ViewProfile when profile exists', async () => {
    // one response for PROFILE_EXISTS and one for MY_PROFILE_QUERY
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
      { profileData: getMyProfile().myProfile as ProfileData },
    ];
    mockUser();
    await act(async () => {
      const {
        getElement,
        waitForIsComplete,
        waitForElement,
      } = await renderTestSuite(responses);
      getElement({ testId: 'load-indicator' });
      await waitForIsComplete();
      await waitForElement({ testId: 'view-profile-heading' });
    });
  });
  it('should render error Toast when query fails', async () => {
    // one response for PROFILE_EXISTS and one for MY_PROFILE_QUERY error
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
      { errorType: 'graphQLError' },
    ];
    mockUser();
    await act(async () => {
      const { waitForElement } = await renderTestSuite(responses);
      await waitForElement({ testId: 'mock-toast-type-error' });
    });
  });
});
