import React from 'react';
import { act } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import { getMyProfile } from '../../../../common/test/myProfileMocking';
import { renderComponentWithMocksAndContexts } from '../../../../common/test/testingLibraryTools';
import { ProfileData } from '../../../../graphql/typings';
import ViewProfile from '../ViewProfile';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import i18n from '../../../../common/test/testi18nInit';
import getMyProfileWithServiceConnections from '../../../../common/test/getMyProfileWithServiceConnections';

// mock children, so they wont make queries
vi.mock('../../deleteProfile/DeleteProfile');
vi.mock('../../downloadData/DownloadData');

const history = createMemoryHistory({ initialEntries: ['/'] });
describe('<ViewProfile /> ', () => {
  const renderTestSuite = async (responses: MockedResponse[]) => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    const renderResult = await renderComponentWithMocksAndContexts(
      responseProvider,
      <Router history={history}>
        <ViewProfile />
      </Router>
    );
    await renderResult.fetch();
    await renderResult.waitForIsComplete();
    return renderResult;
  };
  const t = i18n.getFixedT('fi');
  it('renders profileInformation when route is "/" ', async () => {
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
    ];

    await act(async () => {
      const { waitForElement, getByText } = await renderTestSuite(responses);
      await waitForElement({ testId: 'profile-information-explanation' });
      expect(() =>
        getByText(String(t('profileInformation.title')))
      ).not.toThrow();
    });
  });
  it('renders serviceConnections when route is "/connected-services" ', async () => {
    const responses: MockedResponse[] = [
      {
        profileDataWithServiceConnections: getMyProfileWithServiceConnections(),
      },
    ];

    history.replace('/connected-services');
    await act(async () => {
      const { waitForElement, getByText } = await renderTestSuite(responses);
      await waitForElement({ testId: 'service-connections-explanation' });
      expect(() =>
        getByText(String(t('serviceConnections.explanation')))
      ).not.toThrow();
    });
  });
});
