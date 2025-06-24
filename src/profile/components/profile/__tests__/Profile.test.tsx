import React from 'react';
import { cleanup } from '@testing-library/react';

import { getMyProfile } from '../../../../common/test/myProfileMocking';
import {
  ElementSelector,
  renderComponentWithMocksAndContexts,
} from '../../../../common/test/testingLibraryTools';
import { ProfileData } from '../../../../graphql/typings';
import Profile from '../Profile';
import {
  MockedResponse,
  resetApolloMocks,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import TestLoginProvider from '../../../../common/test/TestLoginProvider';

describe('<Profile />', () => {
  const renderTestSuite = (responses: MockedResponse[]) => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <React.Fragment>
        <TestLoginProvider>
          <Profile />
        </TestLoginProvider>
      </React.Fragment>
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    resetApolloMocks();
  });

  const selectors: Record<string, ElementSelector> = {
    loginRouteIndicator: { testId: 'location-is-login' },
    loadIndicator: { testId: 'load-indicator' },
    profileHeading: { testId: 'profile-information-explanation' },
    createProfileHeading: { testId: 'create-profile-heading' },
    errorLayout: { testId: 'profile-check-error-layout' },
    errorLayoutReloadButton: { testId: 'profile-check-error-reload-button' },
  };

  it('should render load indicator and then ViewProfile when profile exists', async () => {
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
    ];

    const { getElement, waitForIsComplete, waitForElement } =
      await renderTestSuite(responses);
    getElement(selectors.loadIndicator);
    await waitForIsComplete();
    await waitForElement(selectors.profileHeading);
  });
  it('should render profile when data has an allowed error', async () => {
    const responses: MockedResponse[] = [
      {
        profileData: getMyProfile().myProfile as ProfileData,
        withAllowedPermissionError: true,
      },
    ];

    const { waitForIsComplete, waitForElement } =
      await renderTestSuite(responses);
    await waitForIsComplete();
    await waitForElement(selectors.profileHeading);
  });
  it('should render an error notification when query fails', async () => {
    const responses: MockedResponse[] = [{ errorType: 'graphQLError' }];

    const { waitForElement } = await renderTestSuite(responses);
    await waitForElement(selectors.errorLayout);
  });
  it('should render an error notification when profile load fails', async () => {
    const responses: MockedResponse[] = [{ errorType: 'networkError' }];

    const { waitForElement } = await renderTestSuite(responses);
    await waitForElement(selectors.errorLayout);
  });
  it('should retry profile load when reload button is clicked', async () => {
    const responses: MockedResponse[] = [
      { errorType: 'networkError' },
      { profileData: getMyProfile().myProfile as ProfileData },
    ];

    const { waitForElement, clickElement } = await renderTestSuite(responses);
    await waitForElement(selectors.errorLayout);
    await clickElement(selectors.errorLayoutReloadButton);
    await waitForElement(selectors.profileHeading);
  });
});
