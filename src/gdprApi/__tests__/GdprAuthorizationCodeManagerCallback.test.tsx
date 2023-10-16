import React from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  createQueueFromProps,
  Action,
} from '../../common/actionQueue/actionQueue';
import { storeQueue } from '../../common/actionQueue/actionQueueStorage';
import mockWindowLocation from '../../common/test/mockWindowLocation';
import {
  renderComponentWithMocksAndContexts,
  cleanComponentMocks,
} from '../../common/test/testingLibraryTools';
import config from '../../config';
import GdprAuthorizationCodeManagerCallback from '../GdprAuthorizationCodeManagerCallback';
import {
  ActionMockData,
  setMockActionData,
  isActionTriggered,
} from '../actions/__mocks__/mock.util';
import { getScenarioWhereNextPhaseIsResumeCallback } from '../actions/__mocks__/queueScenarios';
import { getQueue } from '../actions/queues';
import {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from '../useAuthCodeQueues';
import { tunnistamoAuthCodeParserAction } from '../actions/authCodeParser';
import { tunnistamoAuthCodeCallbackUrlAction } from '../actions/authCodeCallbackUrlDetector';
import { loadKeycloakConfigAction } from '../actions/loadKeycloakConfig';
import { getMockCallArgs } from '../../common/test/jestMockHelper';

const mockHistoryTracker = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => ({
    push: mockHistoryTracker,
    replace: mockHistoryTracker,
  }),
}));

jest.mock('../actions/queues');

describe('<GdprAuthorizationCodeManagerCallback /> ', () => {
  const mockedWindowControls = mockWindowLocation();

  const onCompleted = jest.fn();
  const onError = jest.fn();

  const downloadQueueProps: AuthCodeQueuesProps = {
    queueName: 'downloadProfile',
    startPagePath: config.downloadPath,
    onCompleted,
    onError,
  };

  // store the queue actions from actual GdprAuthorizationCodeManagerCallbackQueue with new props
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

  const initTests = async () =>
    renderComponentWithMocksAndContexts(
      jest.fn(),
      <GdprAuthorizationCodeManagerCallback />
    );

  afterEach(() => {
    mockedWindowControls.reset();
    cleanComponentMocks();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockedWindowControls.setPath(config.gdprCallbackPath);
  });

  it(`Queue is resumed  - if possible`, async () => {
    initQueue(getScenarioWhereNextPhaseIsResumeCallback());
    await act(async () => {
      await initTests();
      await waitFor(() => {
        expect(
          isActionTriggered(tunnistamoAuthCodeParserAction.type)
        ).toBeTruthy();
      });
    });
  });
  it(`Queue is not resumed when next action is not resumable. (Should redirect!)`, async () => {
    initQueue(
      getScenarioWhereNextPhaseIsResumeCallback({
        overrides: [
          {
            type: tunnistamoAuthCodeCallbackUrlAction.type,
            store: true,
          },
          {
            type: tunnistamoAuthCodeParserAction.type,
            store: true,
          },
        ],
      })
    );
    await act(async () => {
      await initTests();
      await waitFor(() => {
        expect(isActionTriggered(loadKeycloakConfigAction.type)).toBeFalsy();
      });
    });
  });
  it(`If queue fails and failed action will redirect, redirection in not made again.`, async () => {
    initQueue(
      getScenarioWhereNextPhaseIsResumeCallback({
        overrides: [
          {
            type: tunnistamoAuthCodeParserAction.type,
            resolveValue: undefined,
            runOriginal: true,
          },
        ],
      })
    );
    await act(async () => {
      await initTests();
      await waitFor(() => {
        expect(
          isActionTriggered(tunnistamoAuthCodeParserAction.type)
        ).toBeTruthy();
      });
      const lastCall = getMockCallArgs(mockHistoryTracker, 0)[0] as string;
      expect(
        lastCall.includes(`/?error=${tunnistamoAuthCodeParserAction.type}`)
      ).toBeTruthy();
    });
  });
  it(`If queue fails and failed action will not redirect, redirect to start page.`, async () => {
    initQueue(
      getScenarioWhereNextPhaseIsResumeCallback({
        overrides: [
          {
            type: loadKeycloakConfigAction.type,
            resolveValue: undefined,
            rejectValue: new Error('UPS'),
            autoTrigger: true,
            runOriginal: false,
          },
        ],
      })
    );
    await act(async () => {
      await initTests();
      await waitFor(() => {
        expect(isActionTriggered(loadKeycloakConfigAction.type)).toBeTruthy();
      });
      const lastCall = getMockCallArgs(mockHistoryTracker, 0)[0] as string;
      expect(lastCall.includes('/error?message=')).toBeTruthy();
    });
  });
});
