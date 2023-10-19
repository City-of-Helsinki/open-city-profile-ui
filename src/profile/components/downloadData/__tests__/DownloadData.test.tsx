import React from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  cleanComponentMocks,
  ElementSelector,
} from '../../../../common/test/testingLibraryTools';
import DownloadData from '../DownloadData';
import i18n from '../../../../common/test/testi18nInit';
import mockWindowLocation from '../../../../common/test/mockWindowLocation';
import config from '../../../../config';
import {
  ActionMockData,
  initMockQueue,
  isActionTriggered,
} from '../../../../common/actionQueue/mock.util';
import {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from '../../../../gdprApi/useAuthCodeQueues';
import {
  getScenarioForScopes,
  getScenarioWhichGoesFromStartToAuthRedirectAutomatically,
} from '../../../../gdprApi/actions/__mocks__/queueScenarios';
import { tunnistamoAuthCodeRedirectionAction } from '../../../../gdprApi/actions/authCodeRedirectionHandler';
import { getGdprQueryScopesAction } from '../../../../gdprApi/actions/getGdprScopes';

const mockSaveAsListener = jest.fn();

jest.mock('file-saver', () => ({
  saveAs: () => {
    mockSaveAsListener();
  },
}));

jest.mock('../../../../gdprApi/actions/queues');

describe('<DownloadData /> ', () => {
  const mockedWindowControls = mockWindowLocation();

  const onCompleted = jest.fn();
  const onError = jest.fn();

  const downloadQueueProps: AuthCodeQueuesProps = {
    queueName: 'downloadProfile',
    startPagePath: config.downloadPath,
    onCompleted,
    onError,
  };

  const initTestQueue = (props: ActionMockData[]) => {
    initMockQueue(props, downloadQueueProps, authCodeQueuesStorageKey);
  };

  const t = i18n.getFixedT('fi');

  const initTests = async () =>
    renderComponentWithMocksAndContexts(jest.fn(), <DownloadData />);

  const submitButton: ElementSelector = {
    id: 'download-profile-button',
  };
  const errorNotification: ElementSelector = {
    testId: 'download-profile-error',
  };

  afterEach(() => {
    mockedWindowControls.reset();
    cleanComponentMocks();
    jest.clearAllMocks();
  });

  it(`Clicking the button disables it, changes its text and starts the queue.`, async () => {
    initTestQueue(getScenarioWhichGoesFromStartToAuthRedirectAutomatically());
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
        expect(
          isActionTriggered(tunnistamoAuthCodeRedirectionAction.type)
        ).toBeTruthy();
      });
    });
  });

  it(`When load fails, an error is shown.`, async () => {
    initTestQueue(
      getScenarioForScopes({
        autoTrigger: true,
        overrides: [
          {
            type: getGdprQueryScopesAction.type,
            resolveValue: undefined,
            rejectValue: new Error('Failed'),
          },
        ],
      })
    );
    await act(async () => {
      const { clickElement, waitForElement } = await initTests();
      await clickElement(submitButton);
      await waitForElement(errorNotification);
    });
  });
});
