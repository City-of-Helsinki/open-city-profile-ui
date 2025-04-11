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
} from '../../../../common/actionQueue/mock.util';
import {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from '../../../../gdprApi/useAuthCodeQueues';
import {
  getScenarioForScopes,
  getScenarioWhichGoesFromStartToAuthRedirectAutomatically,
} from '../../../../gdprApi/actions/__mocks__/queueScenarios';
import { getGdprQueryScopesAction } from '../../../../gdprApi/actions/getGdprScopes';

const mockSaveAsListener = vi.fn();

vi.mock('file-saver', () => ({
  saveAs: () => {
    mockSaveAsListener();
  },
}));

vi.mock('../../../../gdprApi/actions/queues');

describe('<DownloadData /> ', () => {
  const mockedWindowControls = mockWindowLocation();

  const onCompleted = vi.fn();
  const onError = vi.fn();

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
    renderComponentWithMocksAndContexts(vi.fn(), <DownloadData />);

  const submitButton: ElementSelector = {
    id: 'download-profile-button',
  };
  const errorNotification: ElementSelector = {
    testId: 'download-profile-error',
  };

  const insufficientLoaErrorNotification: ElementSelector = {
    testId: 'download-profile-insufficient-loa-error',
  };

  afterEach(() => {
    mockedWindowControls.reset();
    cleanComponentMocks();
    vi.clearAllMocks();
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

  it(`When insufficient loa, an error is shown.`, async () => {
    initTestQueue(
      getScenarioForScopes({
        autoTrigger: true,
        overrides: [
          {
            type: getGdprQueryScopesAction.type,
            resolveValue: undefined,
            rejectValue: new Error('insufficientLoa'),
          },
        ],
      })
    );
    await act(async () => {
      const { clickElement, waitForElement } = await initTests();
      await clickElement(submitButton);
      await waitForElement(insufficientLoaErrorNotification);
    });
  });
});
