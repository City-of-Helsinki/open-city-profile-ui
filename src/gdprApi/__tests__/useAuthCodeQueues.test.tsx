import React, { useState } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

import useAuthCodeQueues, {
  AuthCodeQueuesProps,
  QueueComponentState,
  authCodeQueuesStorageKey,
  currentPhases,
  nextPhases,
} from '../useAuthCodeQueues';
import {
  Action,
  ActionType,
  createQueueFromProps,
} from '../../common/actionQueue/actionQueue';
import { getServiceConnectionsAction } from '../actions/getServiceConnections';
import { getGdprQueryScopesAction } from '../actions/getGdprScopes';
import { storeQueue } from '../../common/actionQueue/actionQueueStorage';
import mockWindowLocation from '../../common/test/mockWindowLocation';
import config from '../../config';
import {
  keycloakAuthCodeCallbackUrlAction,
  tunnistamoAuthCodeCallbackUrlAction,
} from '../actions/authCodeCallbackUrlDetector';
import {
  defaultRedirectorActionType,
  defaultRedirectionCatcherActionType,
} from '../actions/redirectionHandlers';
import {
  createFailedActionParams,
  createNextActionParams,
} from '../actions/utils';
import {
  keycloakAuthCodeParserAction,
  tunnistamoAuthCodeParserAction,
} from '../actions/authCodeParser';
import { loadKeycloakConfigAction } from '../actions/loadKeycloakConfig';
import {
  cleanMockData,
  completeActionExecutor,
  isActionCompleted,
  isActionTriggered,
  setMockActionData,
  ActionMockData,
} from '../actions/__mocks__/mock.util';
import {
  getScenarioForScopes,
  getScenarioWhereEveryActionCanBeManuallyCompletetedSuccessfully,
  getScenarioWhereKeycloakAuthCodeNotInUrl,
  getScenarioWhereNextPhaseIsResumeCallback,
  getScenarioWhereNextPhaseIsResumeDownload,
  getScenarioWhichGoesFromStartToAuthRedirectAutomatically,
  keycloakState,
  tunnistamoCode,
  tunnistamoOidcUri,
  tunnistamoState,
} from '../actions/__mocks__/queueScenarios';
import {
  keycloakAuthCodeRedirectionAction,
  tunnistamoAuthCodeRedirectionAction,
} from '../actions/authCodeRedirectionHandler';
import { getDownloadDataAction } from '../actions/getDownloadData';
import {
  keycloakRedirectionInitializationAction,
  tunnistamoRedirectionInitializationAction,
} from '../actions/authCodeRedirectionInitialization';
import { downloadAsFileAction } from '../actions/downloadAsFile';
import { actionLogTypes } from '../../common/actionQueue/actionQueueRunner';
import { getQueue } from '../actions/queues';
import { getMockCallArgs } from '../../common/test/jestMockHelper';

type HookFunctionResults = {
  hasError: boolean;
  isLoading: boolean;
  shouldHandleCallback: boolean;
  shouldRestart: boolean;
  shouldResumeDownload: boolean;
  canStart: boolean;
};

const mockTunnistamoOidcUri = tunnistamoOidcUri;

jest.mock('../../auth/authService', () => ({
  __esModule: true,
  ...jest.requireActual('../../auth/authService'),
  default: {
    userManager: {
      metadataService: {
        getAuthorizationEndpoint: () => Promise.resolve(mockTunnistamoOidcUri),
      },
    },
  },
}));

const mockHistoryPushTracker = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => ({
    push: mockHistoryPushTracker,
  }),
}));

jest.mock('file-saver', () => ({
  saveAs: () => jest.fn(),
}));

jest.mock('../actions/queues');

describe('useAuthCodeQueues', () => {
  const elementIds = {
    lastActionType: 'last-action-type',
    startButton: 'start-button',
    renderCount: 'render-count',
    reRenderButton: 're-render',
    unmountButton: 'unmount-button',
    stateDump: 'state-dump',
    functionResults: 'function-results-dump',
    resumeButton: 'resume-button',
  };

  const hookFunctionResultsAsFalse = {
    hasError: false,
    isLoading: false,
    shouldHandleCallback: false,
    shouldRestart: false,
    shouldResumeDownload: false,
    canStart: false,
  };

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

  const TestUseAuthCodeQueuesHook = () => {
    const [renderCount, rerender] = useState(0);
    const forceRender = () => {
      rerender(n => n + 1);
    };
    const {
      startOrRestart,
      hasError,
      isLoading,
      shouldHandleCallback,
      shouldRestart,
      shouldResumeWithAuthCodes: shouldResumeDownload,
      canStart,
      state,
      resume,
    } = useAuthCodeQueues(downloadQueueProps);

    const functionResults = {
      hasError,
      isLoading,
      shouldHandleCallback: shouldHandleCallback(),
      shouldRestart: shouldRestart(),
      shouldResumeDownload: shouldResumeDownload(),
      canStart: canStart(),
    };

    return (
      <div>
        <span id={elementIds.stateDump}>{JSON.stringify(state)}</span>
        <span id={elementIds.functionResults}>
          {JSON.stringify(functionResults)}
        </span>
        <span id={elementIds.renderCount}>{renderCount}</span>

        <button
          id={elementIds.startButton}
          onClick={() => {
            startOrRestart();
          }}
        >
          Start
        </button>
        <button
          id={elementIds.reRenderButton}
          onClick={() => {
            forceRender();
          }}
        >
          Render
        </button>
        <button
          id={elementIds.resumeButton}
          onClick={() => {
            resume();
          }}
        >
          Resume
        </button>
      </div>
    );
  };
  const UnmountingHookWrapper = () => {
    const [shouldRender, updateShouldRender] = useState(true);
    const toggleComponent = () => {
      updateShouldRender(bool => !bool);
    };
    return (
      <div>
        {shouldRender && <TestUseAuthCodeQueuesHook />}
        <button
          id={elementIds.unmountButton}
          onClick={() => {
            toggleComponent();
          }}
        >
          Start
        </button>
      </div>
    );
  };

  const renderTestComponent = () => {
    const result = render(<UnmountingHookWrapper />);
    const { container } = result;

    const getElementById = (id: string) =>
      container.querySelector(`#${id}`) as HTMLElement;

    const getRenderCount = () =>
      parseInt(getElementById(elementIds.renderCount).innerHTML, 10);

    const getState = () =>
      JSON.parse(
        getElementById(elementIds.stateDump).innerHTML
      ) as QueueComponentState;

    const getFunctionResults = () =>
      JSON.parse(
        getElementById(elementIds.functionResults).innerHTML
      ) as HookFunctionResults;

    const start = () => {
      const button = getElementById(elementIds.startButton);
      fireEvent.click(button);
    };

    const resume = () => {
      const button = getElementById(elementIds.resumeButton);
      fireEvent.click(button);
    };

    const rerender = async () => {
      const startCount = getRenderCount();
      const button = getElementById(elementIds.reRenderButton);
      fireEvent.click(button);
      return waitFor(() => {
        if (getRenderCount() === startCount) {
          throw new Error('Not updated');
        }
      });
    };

    const toggleComponentMounting = async () => {
      const getIsMounted = () => !!getElementById(elementIds.reRenderButton);
      const isMounted = getIsMounted();
      const button = getElementById(elementIds.unmountButton);
      fireEvent.click(button);
      return waitFor(() => {
        if (getIsMounted() === isMounted) {
          throw new Error('Not changed');
        }
      });
    };

    return {
      start,
      rerender,
      toggleComponentMounting,
      resume,
      getState,
      getFunctionResults,
    };
  };

  const rejectionError = new Error('Rejected');

  afterAll(() => {
    mockedWindowControls.restore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    cleanMockData();
    mockedWindowControls.reset();
    sessionStorage.clear();
  });

  describe('On download page', () => {
    it('The queue can be started and proceeds to auth code redirection automatically', async () => {
      initQueue(getScenarioWhichGoesFromStartToAuthRedirectAutomatically());
      const { start, getState, getFunctionResults } = renderTestComponent();
      expect(getState()).toMatchObject({
        currentPhase: currentPhases.idle,
        nextPhase: nextPhases.start,
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        canStart: true,
      });

      await act(async () => {
        start();
      });

      await waitFor(() => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.running,
          nextPhase: nextPhases.waitForAuthCodeRedirect,
        });
      });

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });
    });
    it('The queue stops on error and when an action fails, next phase is "restart"', async () => {
      initQueue(
        getScenarioForScopes({
          overrides: [
            {
              type: getGdprQueryScopesAction.type,
              resolveValue: undefined,
              rejectValue: rejectionError,
            },
          ],
        })
      );
      const { start, getFunctionResults, getState } = renderTestComponent();
      expect(getState()).toMatchObject({
        currentPhase: currentPhases.idle,
        nextPhase: nextPhases.start,
      });
      await act(async () => {
        start();

        await waitFor(() => {
          expect(getFunctionResults().isLoading).toBeTruthy();
          expect(
            isActionTriggered(getServiceConnectionsAction.type)
          ).toBeTruthy();
        });

        completeActionExecutor(getServiceConnectionsAction.type);
        await waitFor(() => {
          expect(isActionTriggered(getGdprQueryScopesAction.type)).toBeTruthy();
        });
        completeActionExecutor(getGdprQueryScopesAction.type);
        await waitFor(() => {
          expect(getFunctionResults().hasError).toBeTruthy();
          expect(
            isActionCompleted(getServiceConnectionsAction.type)
          ).toBeTruthy();
          expect(getFunctionResults().isLoading).toBeFalsy();
        });
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.error,
          nextPhase: nextPhases.restart,
        });
        expect(getFunctionResults()).toMatchObject({
          ...hookFunctionResultsAsFalse,
          hasError: true,
          shouldRestart: true,
        });
      });
    });
    it('When redirection times out, an error is logged and next phase is "restart"', async () => {
      // timeout is not tested here, there is a test for it in the action's own tests
      // this test just rejects the promise like a timeout would.
      initQueue(
        getScenarioWhichGoesFromStartToAuthRedirectAutomatically({
          overrides: [
            {
              type: tunnistamoAuthCodeRedirectionAction.type,
              rejectValue: rejectionError,
              resolveValue: undefined,
              autoTrigger: true,
            },
          ],
        })
      );
      const { start, getState, getFunctionResults } = renderTestComponent();
      await act(async () => {
        start();
        await waitFor(() => {
          expect(getState()).toMatchObject({
            currentPhase: currentPhases.error,
            nextPhase: nextPhases.restart,
          });
        });
        expect(
          isActionCompleted(tunnistamoAuthCodeRedirectionAction.type)
        ).toBeTruthy();
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        hasError: true,
        shouldRestart: true,
      });
    });
  });
  describe('On GDPR callback page', () => {
    beforeEach(() => {
      mockedWindowControls.setPath(config.gdprCallbackPath);
    });
    it('When codes are fetched, next action will redirect back to start page.', async () => {
      mockedWindowControls.setSearch(
        `state=${tunnistamoState}&code=${tunnistamoCode}`
      );
      initQueue(getScenarioWhereNextPhaseIsResumeCallback());
      const { resume, getState, getFunctionResults } = renderTestComponent();
      await waitFor(() => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.idle,
          nextPhase: nextPhases.resumeCallback,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldHandleCallback: true,
      });
      resume();
      await waitFor(() => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.running,
        });
      });
      await waitFor(() => {
        expect(isActionCompleted(loadKeycloakConfigAction.type)).toBeTruthy();
      });
      await waitFor(() => {
        expect(mockHistoryPushTracker).toHaveBeenLastCalledWith(
          '/?next=redirectionCatcher'
        );
        expect(getState()).toMatchObject({
          nextPhase: nextPhases.waitForInternalRedirect,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });
    });
    it('When an action fails, an error is logged and redirection to start page is done', async () => {
      mockedWindowControls.setSearch(`state=${keycloakState}&code=`);
      initQueue(getScenarioWhereKeycloakAuthCodeNotInUrl());
      const { resume, getState, getFunctionResults } = renderTestComponent();
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.idle,
          nextPhase: nextPhases.resumeCallback,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldHandleCallback: true,
      });
      resume();
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.running,
        });
      });

      completeActionExecutor(keycloakAuthCodeCallbackUrlAction.type);

      await waitFor(async () => {
        expect(
          isActionCompleted(keycloakAuthCodeCallbackUrlAction.type)
        ).toBeTruthy();
      });

      await waitFor(async () => {
        expect(
          isActionCompleted(keycloakAuthCodeParserAction.type)
        ).toBeTruthy();
      });
      await waitFor(async () => {
        expect(mockHistoryPushTracker).toHaveBeenCalledTimes(1);
        const lastCall = getMockCallArgs(
          mockHistoryPushTracker,
          0
        )[0] as string;

        expect(
          lastCall.includes(`/?error=${keycloakAuthCodeParserAction.type}`)
        ).toBeTruthy();
      });

      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.error,
          nextPhase: nextPhases.waitForInternalRedirect,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        hasError: true,
      });
    });
  });
  describe('When returned to download page', () => {
    it('from successful auth code retrieval, next phase is "resume-download"', async () => {
      mockedWindowControls.setPath(config.downloadPath);
      mockedWindowControls.setSearch(
        createNextActionParams({
          type: defaultRedirectionCatcherActionType,
        } as Action)
      );
      initQueue(getScenarioWhereNextPhaseIsResumeDownload());

      const { resume, getState, getFunctionResults } = renderTestComponent();
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.idle,
          nextPhase: nextPhases.resumeWithAuthCodes,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldResumeDownload: true,
      });
      resume();
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.complete,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldRestart: true,
      });
    });
    it('when storage has a queue with failed auth code retrieval, nextPhase is "restart"', async () => {
      mockedWindowControls.setPath(config.downloadPath);
      mockedWindowControls.setSearch(
        createFailedActionParams(tunnistamoAuthCodeCallbackUrlAction as Action)
      );
      initQueue(
        getScenarioWhereNextPhaseIsResumeCallback({
          overrides: [
            {
              type: tunnistamoAuthCodeCallbackUrlAction.type,
              rejectValue: rejectionError,
              store: true,
            },
          ],
        })
      );

      const { getState, start, getFunctionResults } = renderTestComponent();
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.complete,
          nextPhase: nextPhases.restart,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldRestart: true,
        hasError: true,
      });
      start();
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.running,
          lastActionType: getServiceConnectionsAction.type,
        });
      });
    });
    it('if download data fails, next phase is "restart"', async () => {
      mockedWindowControls.setPath(config.downloadPath);
      mockedWindowControls.setSearch(
        createNextActionParams({
          type: defaultRedirectionCatcherActionType,
        } as Action)
      );
      initQueue(
        getScenarioWhereNextPhaseIsResumeDownload({
          overrides: [
            {
              type: getDownloadDataAction.type,
              rejectValue: new Error('FAIL'),
              resolveValue: undefined,
              autoTrigger: true,
            },
          ],
        })
      );

      const { resume, getState, getFunctionResults } = renderTestComponent();
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.idle,
          nextPhase: nextPhases.resumeWithAuthCodes,
        });
      });
      resume();
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.error,
          nextPhase: nextPhases.restart,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldRestart: true,
        hasError: true,
      });
    });
  });
  describe('Manually processing whole queue', () => {
    it('phases change and re-rendering or unmounting (in correct phases) wont affect anything', async () => {
      initQueue(
        getScenarioWhereEveryActionCanBeManuallyCompletetedSuccessfully()
      );
      const {
        start,
        getState,
        rerender,
        toggleComponentMounting,
        resume,
        getFunctionResults,
      } = renderTestComponent();

      const checkCurrentActionAndManuallyCompleteIt = async (
        actionType: ActionType,
        nextActionType?: ActionType
      ) => {
        expect(isActionTriggered(actionType)).toBeTruthy();
        expect(getState()).toMatchObject({
          lastActionType: actionType,
          lastLogType: actionLogTypes.started,
        });
        completeActionExecutor(actionType);
        expect(isActionCompleted(actionType)).toBeTruthy();
        if (nextActionType) {
          await waitFor(() => {
            expect(getState()).toMatchObject({
              lastActionType: nextActionType,
              lastLogType: actionLogTypes.started,
            });
          });
        }
      };

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.idle,
        nextPhase: nextPhases.start,
      });
      await act(async () => {
        start();
      });
      await act(async () => {
        await checkCurrentActionAndManuallyCompleteIt(
          getServiceConnectionsAction.type,
          getGdprQueryScopesAction.type
        );
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.running,
          nextPhase: nextPhases.waitForAction,
        });
      });

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });

      await rerender();
      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAction,
        lastActionType: getGdprQueryScopesAction.type,
        lastLogType: actionLogTypes.started,
      });

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        getGdprQueryScopesAction.type,
        tunnistamoRedirectionInitializationAction.type
      );
      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAction,
      });

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        tunnistamoRedirectionInitializationAction.type,
        tunnistamoAuthCodeRedirectionAction.type
      );
      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAuthCodeRedirect,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        tunnistamoAuthCodeRedirectionAction.type,
        tunnistamoAuthCodeCallbackUrlAction.type
      );

      await toggleComponentMounting();
      mockedWindowControls.setPath(config.gdprCallbackPath);
      await toggleComponentMounting();

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.idle,
        nextPhase: nextPhases.resumeCallback,
      });

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldHandleCallback: true,
      });

      resume();

      await checkCurrentActionAndManuallyCompleteIt(
        tunnistamoAuthCodeCallbackUrlAction.type,
        tunnistamoAuthCodeParserAction.type
      );

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAction,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        tunnistamoAuthCodeParserAction.type,
        loadKeycloakConfigAction.type
      );
      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAction,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        loadKeycloakConfigAction.type,
        keycloakRedirectionInitializationAction.type
      );
      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAction,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        keycloakRedirectionInitializationAction.type,
        keycloakAuthCodeRedirectionAction.type
      );

      await rerender();

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAuthCodeRedirect,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        keycloakAuthCodeRedirectionAction.type,
        keycloakAuthCodeCallbackUrlAction.type
      );

      await toggleComponentMounting();
      mockedWindowControls.setPath(config.gdprCallbackPath);
      await toggleComponentMounting();

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.idle,
        nextPhase: nextPhases.resumeCallback,
      });

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldHandleCallback: true,
      });

      resume();

      await checkCurrentActionAndManuallyCompleteIt(
        keycloakAuthCodeCallbackUrlAction.type,
        keycloakAuthCodeParserAction.type
      );

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAction,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        keycloakAuthCodeParserAction.type,
        defaultRedirectorActionType
      );

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForInternalRedirect,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        defaultRedirectionCatcherActionType
      );

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForInternalRedirect,
      });

      expect(mockHistoryPushTracker).toHaveBeenLastCalledWith(
        '/?next=redirectionCatcher'
      );

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });

      await toggleComponentMounting();
      mockedWindowControls.setPath(config.downloadPath);
      mockedWindowControls.setSearch(
        createNextActionParams({
          type: defaultRedirectionCatcherActionType,
        } as Action)
      );
      await toggleComponentMounting();

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.idle,
        nextPhase: nextPhases.resumeWithAuthCodes,
      });

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldResumeDownload: true,
      });

      resume();

      await checkCurrentActionAndManuallyCompleteIt(
        defaultRedirectionCatcherActionType,
        getDownloadDataAction.type
      );

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAction,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        getDownloadDataAction.type,
        downloadAsFileAction.type
      );

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.running,
        nextPhase: nextPhases.waitForAction,
      });

      await checkCurrentActionAndManuallyCompleteIt(downloadAsFileAction.type);
      await waitFor(async () => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.complete,
          nextPhase: nextPhases.restart,
        });
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldRestart: true,
      });
    });
  });
  describe('If queue is restored (from storage) in some unintended and unresumable position', () => {
    it('nextPhase is "stoppedInMidQueue", and queue can be restarted.', async () => {
      initQueue(
        getScenarioWhereEveryActionCanBeManuallyCompletetedSuccessfully()
      );
      const {
        start,
        getState,
        toggleComponentMounting,
        getFunctionResults,
      } = renderTestComponent();

      expect(getState()).toMatchObject({
        currentPhase: currentPhases.idle,
        nextPhase: nextPhases.start,
      });
      await act(async () => {
        start();
      });
      await act(async () => {
        expect(getState().currentPhase === currentPhases.running).toBeTruthy();
        expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();
      });
      completeActionExecutor(getServiceConnectionsAction.type);
      await waitFor(async () => {
        expect(
          getState().lastActionType === getGdprQueryScopesAction.type
        ).toBeTruthy();
      });
      await toggleComponentMounting();
      await toggleComponentMounting();
      await waitFor(async () => {
        expect(getState().currentPhase === currentPhases.idle).toBeTruthy();
        expect(
          getState().nextPhase === nextPhases.stoppedInMidQueue
        ).toBeTruthy();
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldRestart: true,
      });
      cleanMockData();
      start();
      await act(async () => {
        expect(getState().currentPhase === currentPhases.running).toBeTruthy();
        expect(
          getState().lastActionType === getServiceConnectionsAction.type
        ).toBeTruthy();
      });
    });
  });
  describe('onCompleted and onError callbacks are only triggered when queue is complete', () => {
    it('onCompleted is called when queue is completed without errors.', async () => {
      mockedWindowControls.setPath(config.downloadPath);
      mockedWindowControls.setSearch(
        createNextActionParams({
          type: defaultRedirectionCatcherActionType,
        } as Action)
      );
      initQueue(getScenarioWhereNextPhaseIsResumeDownload());
      const { resume, getState, rerender } = renderTestComponent();
      expect(onCompleted).toHaveBeenCalledTimes(0);
      expect(onError).toHaveBeenCalledTimes(0);

      await act(async () => {
        resume();
      });

      await waitFor(() => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.complete,
          nextPhase: nextPhases.restart,
        });
      });

      expect(onCompleted).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledTimes(0);

      await rerender();
      await rerender();

      expect(onCompleted).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledTimes(0);
    });
    it('onError is called when queue fails. Again after restart', async () => {
      initQueue(
        getScenarioForScopes({
          autoTrigger: true,
          overrides: [
            {
              type: getGdprQueryScopesAction.type,
              resolveValue: undefined,
              rejectValue: rejectionError,
            },
          ],
        })
      );
      const {
        start,
        getState,
        rerender,
        toggleComponentMounting,
      } = renderTestComponent();
      expect(onCompleted).toHaveBeenCalledTimes(0);
      expect(onError).toHaveBeenCalledTimes(0);

      await act(async () => {
        start();
      });

      await waitFor(() => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.error,
        });
      });

      expect(onCompleted).toHaveBeenCalledTimes(0);
      expect(onError).toHaveBeenCalledTimes(1);

      await rerender();
      await rerender();

      expect(onCompleted).toHaveBeenCalledTimes(0);
      expect(onError).toHaveBeenCalledTimes(1);

      await toggleComponentMounting();
      await toggleComponentMounting();

      expect(onCompleted).toHaveBeenCalledTimes(0);
      expect(onError).toHaveBeenCalledTimes(1);

      await act(async () => {
        start();
      });

      await waitFor(() => {
        expect(getState()).toMatchObject({
          currentPhase: currentPhases.error,
        });
      });

      expect(onCompleted).toHaveBeenCalledTimes(0);
      expect(onError).toHaveBeenCalledTimes(2);
    });
  });
});
