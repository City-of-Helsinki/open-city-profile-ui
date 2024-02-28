import React from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  cleanComponentMocks,
} from '../../common/test/testingLibraryTools';
import config from '../../config';
import GdprAuthorizationCodeManagerCallback from '../GdprAuthorizationCodeManagerCallback';
import {
  ActionMockData,
  isActionTriggered,
  initMockQueue,
} from '../../common/actionQueue/mock.util';
import { getScenarioWhereNextPhaseIsResumeCallback } from '../actions/__mocks__/queueScenarios';
import {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from '../useAuthCodeQueues';
import { tunnistamoAuthCodeParserAction } from '../actions/authCodeParser';
import { tunnistamoAuthCodeCallbackUrlAction } from '../actions/authCodeCallbackUrlDetector';
import { loadKeycloakConfigAction } from '../actions/loadKeycloakConfig';
import { getMockCallArgs } from '../../common/test/mockHelper';
import mockWindowLocation from '../../common/test/mockWindowLocation';

const mockHistoryTracker = vi.fn();

vi.mock('react-router', async () => {
  const module = await vi.importActual('react-router');

  return {
    ...module,
    useHistory: () => ({
      push: mockHistoryTracker,
      replace: mockHistoryTracker,
    }),
  };
});

vi.mock('../actions/queues');

describe('<GdprAuthorizationCodeManagerCallback /> ', () => {
  const mockedWindowControls = mockWindowLocation();

  const onCompleted = vi.fn();
  const onError = vi.fn();

  const startPagePath = '/start-page';

  const downloadQueueProps: AuthCodeQueuesProps = {
    queueName: 'downloadProfile',
    startPagePath,
    onCompleted,
    onError,
  };

  const initTestQueue = (props: ActionMockData[]) => {
    initMockQueue(props, downloadQueueProps, authCodeQueuesStorageKey);
  };

  const initTests = async () =>
    renderComponentWithMocksAndContexts(
      vi.fn(),
      <GdprAuthorizationCodeManagerCallback />
    );

  const getRedirectPath = () =>
    getMockCallArgs(mockHistoryTracker, 0)[0] as string;

  afterEach(() => {
    mockedWindowControls.reset();
    cleanComponentMocks();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockedWindowControls.setPath(config.gdprCallbackPath);
  });

  it(`Queue is resumed  - if possible`, async () => {
    initTestQueue(getScenarioWhereNextPhaseIsResumeCallback());
    await act(async () => {
      await initTests();
      await waitFor(() => {
        expect(
          isActionTriggered(tunnistamoAuthCodeParserAction.type)
        ).toBeTruthy();
      });
    });
  });
  it(`Queue is not resumed when next action is not resumable.
          User is redirected to the start or error page`, async () => {
    initTestQueue(
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
      await waitFor(() => {
        expect(getRedirectPath().includes(`${startPagePath}?`)).toBeTruthy();
      });
    });
  });
  it(`If queue fails and failed action will redirect, redirection in not made again.`, async () => {
    initTestQueue(
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
      expect(mockHistoryTracker).toHaveBeenCalledTimes(1);
      expect(
        getRedirectPath().includes(
          `${startPagePath}?error=${tunnistamoAuthCodeParserAction.type}`
        )
      ).toBeTruthy();
    });
  });
  it(`If queue fails and failed action will not redirect, redirect to start page.`, async () => {
    initTestQueue(
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
        expect(
          getRedirectPath().includes(
            `${startPagePath}?error=${loadKeycloakConfigAction.type}`
          )
        ).toBeTruthy();
      });
    });
  });
});
