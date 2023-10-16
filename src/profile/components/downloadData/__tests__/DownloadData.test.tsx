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
import {
  Action,
  createQueueFromProps,
} from '../../../../common/actionQueue/actionQueue';
import { storeQueue } from '../../../../common/actionQueue/actionQueueStorage';
import config from '../../../../config';
import {
  ActionMockData,
  isActionTriggered,
  setMockActionData,
} from '../../../../gdprApi/actions/__mocks__/mock.util';
import { getQueue } from '../../../../gdprApi/actions/queues';
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

  // store the queue actions from actual downloadDataQueue with new props
  const setStoredState = (overrideQueueProps: Partial<Action>[]) => {
    const queue = getQueue(downloadQueueProps).map(queueProps => {
      const overrides =
        overrideQueueProps.find(op => op.type === queueProps.type) || {};
      return {
        ...queueProps,
        ...overrides,
      };
    });
    storeQueue(authCodeQueuesStorageKey, createQueueFromProps(queue));
  };

  // set mocked responses and stored data
  const initQueue = (props: ActionMockData[]) => {
    const storedProps: Partial<Action>[] = [];
    props.forEach(data => {
      setMockActionData(data);
      if (data.store) {
        storedProps.push({
          type: data.type,
          complete: true, //!data.storeAsActive
          errorMessage: data.rejectValue ? String(data.rejectValue) : undefined,
          result: data.resolveValue,
          active: !!data.storeAsActive,
        });
      }
    });
    if (storedProps.length) {
      setStoredState(storedProps);
    }
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
    initQueue(getScenarioWhichGoesFromStartToAuthRedirectAutomatically());
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
    initQueue(
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
