import React from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
} from '../../../../common/test/testingLibraryTools';
import DownloadData from '../DownloadData';
import { ResponseProvider } from '../../../../common/test/MockApolloClientProvider';
import getMyProfileWithServiceConnections from '../../../../common/test/getMyProfileWithServiceConnections';
import i18n from '../../../../common/test/testi18nInit';
import { DownloadMyProfileQueryVariables } from '../../../../graphql/generatedTypes';

const mockSaveAsListener = jest.fn();

jest.mock(
  '../../../../gdprApi/useAuthorizationCode.ts',
  () => (...args: [string, (code: string) => void]) => [
    async () => {
      const cb = args[1];
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
      return Promise.resolve(cb('code'));
    },
    false,
  ]
);

jest.mock('file-saver', () => ({
  saveAs: () => {
    mockSaveAsListener();
  },
}));

describe('<DownloadData /> ', () => {
  let responseCounter = -1;
  const serviceConnections = getMyProfileWithServiceConnections(true);

  const queryVariableTracker = jest.fn();
  const t = i18n.getFixedT('fi');

  const renderTestSuite = (errorResponseIndex = -1) => {
    const responseProvider: ResponseProvider = payload => {
      responseCounter = responseCounter + 1;
      queryVariableTracker(payload as DownloadMyProfileQueryVariables);
      if (responseCounter === errorResponseIndex) {
        return { errorType: 'networkError' };
      }
      if (
        payload &&
        (payload as DownloadMyProfileQueryVariables).authorizationCode
      ) {
        return { downloadMyProfile: {} };
      }

      return { profileDataWithServiceConnections: serviceConnections };
    };

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <DownloadData />
    );
  };

  const submitButton: ElementSelector = {
    id: 'download-profile-button',
  };
  const errorNotification: ElementSelector = {
    testId: 'download-profile-error',
  };

  beforeEach(() => {
    responseCounter = -1;
  });
  afterEach(() => {
    cleanComponentMocks();
    jest.clearAllMocks();
  });

  const initTests = async (errorResponseIndex = -1): Promise<TestTools> =>
    renderTestSuite(errorResponseIndex);

  it(`Submitting disables the button and changes its text.`, async () => {
    await act(async () => {
      const { clickElement, getElement, isDisabled } = await initTests();
      await clickElement(submitButton);

      await waitFor(() => {
        const button = getElement(submitButton) as HTMLElement;
        if (!isDisabled(button)) {
          throw new Error('NOT DISABLED');
        }
        expect(button.textContent).toBe(t('loading'));
      });
      await waitFor(() => {
        expect(mockSaveAsListener).toHaveBeenCalledTimes(1);
      });
      expect(queryVariableTracker).toHaveBeenLastCalledWith({
        authorizationCode: 'code',
      });
    });
  });

  it(`When load fails, an error is shown.`, async () => {
    await act(async () => {
      const { clickElement, waitForElement } = await initTests(1);
      await clickElement(submitButton);
      await waitForElement(errorNotification);
    });
  });
});
