import React from 'react';
import { waitFor } from '@testing-library/react';

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
import { keycloakAuthCodeParserAction } from '../actions/authCodeParser';
import { keycloakAuthCodeCallbackUrlAction } from '../actions/authCodeCallbackUrlDetector';
import { loadKeycloakConfigAction } from '../actions/loadKeycloakConfig';
import mockWindowLocation from '../../common/test/mockWindowLocation';

const mockHistoryTracker = vi.fn();

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    useNavigate: () => mockHistoryTracker,
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

  const getRedirectPath = () => mockHistoryTracker.mock.calls[0][0];

  afterEach(() => {
    mockedWindowControls.reset();
    cleanComponentMocks();
    vi.clearAllMocks();
    mockHistoryTracker.mockReset();
  });

  beforeEach(() => {
    mockedWindowControls.setPath(config.gdprCallbackPath);
  });

  it(`Queue is resumed - if possible`, async () => {
    initTestQueue(getScenarioWhereNextPhaseIsResumeCallback());

    await initTests();
    await waitFor(() => {
      expect(isActionTriggered(keycloakAuthCodeParserAction.type)).toBeTruthy();
    });
  });

  it(`Queue is not resumed when next action is not resumable.
    User is redirected to the start or error page`, async () => {
    initTestQueue(
      getScenarioWhereNextPhaseIsResumeCallback({
        overrides: [
          {
            type: keycloakAuthCodeCallbackUrlAction.type,
            store: true,
          },
          {
            type: keycloakAuthCodeParserAction.type,
            store: true,
          },
        ],
      })
    );

    await initTests();
    await waitFor(() => {
      expect(isActionTriggered(loadKeycloakConfigAction.type)).toBeFalsy();
    });
    await waitFor(() => {
      expect(getRedirectPath().includes(`${startPagePath}?`)).toBeTruthy();
    });
  });

  it(`If queue fails and failed action will redirect, redirection is not made again.`, async () => {
    initTestQueue(
      getScenarioWhereNextPhaseIsResumeCallback({
        overrides: [
          {
            type: keycloakAuthCodeParserAction.type,
            resolveValue: undefined,
            runOriginal: true,
          },
        ],
      })
    );

    await initTests();
    await waitFor(() => {
      expect(isActionTriggered(keycloakAuthCodeParserAction.type)).toBeTruthy();
    });
    expect(mockHistoryTracker).toHaveBeenCalled();
    expect(getRedirectPath().includes(`${startPagePath}`)).toBeTruthy();
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

    await initTests();
    await waitFor(() => {
      expect(
        getRedirectPath().includes(
          `${startPagePath}?error=${loadKeycloakConfigAction.type}`
        )
      ).toBeTruthy();
    });
  });
});
