import React from 'react';
import { act } from '@testing-library/react';

import { getMyProfile } from '../../../../common/test/myProfileMocking';
import { renderProfileContextWrapper } from '../../../../common/test/componentMocking';
import { ProfileData } from '../../../../graphql/typings';
import ViewProfile from '../ViewProfile';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';

// mock children, so they wont make queries
jest.mock('../../deleteProfile/DeleteProfile');
jest.mock('../../downloadData/DownloadData');

describe('<ViewProfile /> ', () => {
  const renderTestSuite = (responses: MockedResponse[]) => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderProfileContextWrapper(responseProvider, <ViewProfile />);
  };

  it('renders user"s name or nickname in header  ', async () => {
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
    ];

    await act(async () => {
      const {
        getElement,
        waitForIsComplete,
        fetch,
        waitForElement,
      } = await renderTestSuite(responses);
      await fetch();
      await waitForIsComplete();
      await waitForElement({ testId: 'view-profile-heading' });
      const header = getElement({ testId: 'view-profile-heading' });
      expect(header?.children[1].textContent).toEqual('Teme');
    });
  });
});
