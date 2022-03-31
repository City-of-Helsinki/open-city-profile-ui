import React from 'react';
import { User } from 'oidc-client';
import { act, cleanup } from '@testing-library/react';

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
import { submitCreateProfileForm } from '../../../../common/test/commonUiActions';
import { mockProfileCreator } from '../../../../common/test/userMocking';
describe('<Profile />', () => {
  const renderTestSuite = (responses: MockedResponse[]) => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    const user = ({
      profile: mockProfileCreator(),
      access_token: 'huuhaa',
      expired: false,
    } as unknown) as User;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <React.Fragment>
        <Profile user={user} />
      </React.Fragment>
    );
  };

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
    resetApolloMocks();
  });

  const selectors: Record<string, ElementSelector> = {
    loginRouteIndicator: { testId: 'location-is-login' },
    loadIndicator: { testId: 'load-indicator' },
    profileHeading: { testId: 'view-profile-heading' },
    createProfileHeading: { testId: 'create-profile-heading' },
    errorLayout: { testId: 'profile-check-error-layout' },
    errorLayoutReloadButton: { testId: 'profile-check-error-reload-button' },
  };

  it('should render load indicator and then CreateProfile when profile does not exist', async () => {
    const responses: MockedResponse[] = [{ profileData: null }];
    await act(async () => {
      const { waitForElement, getElement } = await renderTestSuite(responses);
      getElement(selectors.loadIndicator);
      await waitForElement(selectors.createProfileHeading);
    });
  });

  it('should load and render profile after it has been created', async () => {
    const responses: MockedResponse[] = [
      { profileData: null },
      { createMyProfile: {} },
      { profileData: getMyProfile().myProfile as ProfileData },
    ];
    await act(async () => {
      const testTools = await renderTestSuite(responses);
      const { waitForElement, getElement } = testTools;
      getElement(selectors.loadIndicator);
      await waitForElement(selectors.createProfileHeading);
      await submitCreateProfileForm(testTools);
      await waitForElement(selectors.profileHeading);
    });
  });

  it('should render load indicator and then ViewProfile when profile exists', async () => {
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
    ];
    await act(async () => {
      const {
        getElement,
        waitForIsComplete,
        waitForElement,
      } = await renderTestSuite(responses);
      getElement(selectors.loadIndicator);
      await waitForIsComplete();
      await waitForElement(selectors.profileHeading);
    });
  });
  it('should render profile when data has an allowed error', async () => {
    const responses: MockedResponse[] = [
      {
        profileData: getMyProfile().myProfile as ProfileData,
        withAllowedPermissionError: true,
      },
    ];
    await act(async () => {
      const { waitForIsComplete, waitForElement } = await renderTestSuite(
        responses
      );
      await waitForIsComplete();
      await waitForElement(selectors.profileHeading);
    });
  });
  it('should render an error notification when query fails', async () => {
    const responses: MockedResponse[] = [{ errorType: 'graphQLError' }];
    await act(async () => {
      const { waitForElement } = await renderTestSuite(responses);
      await waitForElement(selectors.errorLayout);
    });
  });
  it('should render an error notification when profile load fails', async () => {
    const responses: MockedResponse[] = [{ errorType: 'networkError' }];
    await act(async () => {
      const { waitForElement } = await renderTestSuite(responses);
      await waitForElement(selectors.errorLayout);
    });
  });
  it('should retry profile load when reload button is clicked', async () => {
    const responses: MockedResponse[] = [
      { errorType: 'networkError' },
      { profileData: getMyProfile().myProfile as ProfileData },
    ];
    await act(async () => {
      const { waitForElement, clickElement } = await renderTestSuite(responses);
      await waitForElement(selectors.errorLayout);
      await clickElement(selectors.errorLayoutReloadButton);
      await waitForElement(selectors.profileHeading);
    });
  });
});
