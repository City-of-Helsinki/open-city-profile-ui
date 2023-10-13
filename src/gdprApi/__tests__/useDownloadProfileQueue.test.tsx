import React, { useState } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

import useDownloadProfileQueue, {
  QueueComponentState,
  currentPhases,
  nextPhases,
} from '../useDownloadProfileQueue';
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
  getScenarioForTunnistamoAuth,
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

describe('useDownloadProfileQueue', () => {
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

  // store the queue actions from actual downloadDataQueue with new props
  const setStoredState = (overrideQueueProps: Partial<Action>[]) => {
    const queue = getQueue('downloadProfile', config.downloadPath).map(
      queueProps => {
        const overrides =
          overrideQueueProps.find(op => op.type === queueProps.type) || {};
        return {
          ...queueProps,
          ...overrides,
        };
      }
    );
    storeQueue('downloadProfileQueue', createQueueFromProps(queue));
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

  const TestUseDownloadProfileQueueHook = () => {
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
    } = useDownloadProfileQueue();

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
        {shouldRender && <TestUseDownloadProfileQueueHook />}
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
        expect(getState().currentPhase === currentPhases.error).toBeTruthy();
        expect(getState().nextPhase === nextPhases.restart).toBeTruthy();
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
          expect(getState().currentPhase === currentPhases.error).toBeTruthy();
          expect(getState().nextPhase === nextPhases.restart).toBeTruthy();
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
    it('When codes are fetched, next phase is "resume-callback". User is redirected to the download page', async () => {
      mockedWindowControls.setSearch(
        `state=${tunnistamoState}&code=${tunnistamoCode}`
      );
      initQueue(getScenarioWhereNextPhaseIsResumeCallback());
      const { resume, getState, getFunctionResults } = renderTestComponent();
      await waitFor(() => {
        expect(getState().currentPhase === currentPhases.idle).toBeTruthy();
        expect(getState().nextPhase === nextPhases.resumeCallback).toBeTruthy();
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldHandleCallback: true,
      });
      resume();
      await waitFor(() => {
        expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      });
      await waitFor(() => {
        expect(isActionCompleted(loadKeycloakConfigAction.type)).toBeTruthy();
      });
      await waitFor(() => {
        expect(mockHistoryPushTracker).toHaveBeenCalledTimes(1);
        expect(
          getState().nextPhase === nextPhases.redirectBackToStartPage
        ).toBeTruthy();
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });
    });
    it('When an action fails, an error is logged and redirection to download page is done', async () => {
      mockedWindowControls.setSearch(`state=${keycloakState}&code=`);
      initQueue(getScenarioWhereKeycloakAuthCodeNotInUrl());
      const { resume, getState, getFunctionResults } = renderTestComponent();
      await waitFor(async () => {
        expect(getState().currentPhase === currentPhases.idle).toBeTruthy();
        expect(getState().nextPhase === nextPhases.resumeCallback).toBeTruthy();
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldHandleCallback: true,
      });
      resume();
      await waitFor(async () => {
        expect(getState().currentPhase === currentPhases.running).toBeTruthy();
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
      });

      await waitFor(async () => {
        expect(getState().currentPhase === currentPhases.error).toBeTruthy();
        expect(
          getState().nextPhase === nextPhases.redirectBackToStartPage
        ).toBeTruthy();
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        hasError: true,
      });
    });
    it('Download page redirection is always done when gdpr-callback page has an error', async () => {
      initQueue([
        ...getScenarioForScopes({ store: true }),
        ...getScenarioForTunnistamoAuth({
          store: true,
          overrides: [
            {
              type: tunnistamoAuthCodeCallbackUrlAction.type,
              rejectValue: rejectionError,
              resolveValue: undefined,
              store: false,
              autoTrigger: true,
            },
            {
              type: tunnistamoAuthCodeParserAction.type,
              store: false,
            },
          ],
        }),
      ]);
      const { resume, getState, getFunctionResults } = renderTestComponent();
      resume();
      await waitFor(async () => {
        expect(mockHistoryPushTracker).toHaveBeenCalledTimes(1);
        expect(getState().currentPhase === currentPhases.error).toBeTruthy();
        expect(
          getState().nextPhase === nextPhases.redirectBackToStartPage
        ).toBeTruthy();
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
        expect(getState().currentPhase === currentPhases.idle).toBeTruthy();
        expect(
          getState().nextPhase === nextPhases.resumeWithAuthCodes
        ).toBeTruthy();
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldResumeDownload: true,
      });
      resume();
      await waitFor(async () => {
        expect(getState().currentPhase === currentPhases.complete).toBeTruthy();
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
        expect(getState().currentPhase === currentPhases.complete).toBeTruthy();
        expect(getState().nextPhase === nextPhases.restart).toBeTruthy();
      });
      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldRestart: true,
        hasError: true,
      });
      start();
      await waitFor(async () => {
        expect(getState().currentPhase === currentPhases.running).toBeTruthy();
        expect(
          getState().lastActionType === getServiceConnectionsAction.type
        ).toBeTruthy();
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
        expect(getState().currentPhase === currentPhases.idle).toBeTruthy();
        expect(
          getState().nextPhase === nextPhases.resumeWithAuthCodes
        ).toBeTruthy();
      });
      resume();
      await waitFor(async () => {
        expect(getState().currentPhase === currentPhases.error).toBeTruthy();
        expect(getState().nextPhase === nextPhases.restart).toBeTruthy();
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
        expect(getState().lastActionType === actionType).toBeTruthy();
        expect(getState().lastLogType === actionLogTypes.started).toBeTruthy();
        completeActionExecutor(actionType);
        expect(isActionCompleted(actionType)).toBeTruthy();
        if (nextActionType) {
          await waitFor(() => {
            expect(getState().lastActionType === nextActionType).toBeTruthy();
            expect(
              getState().lastLogType === actionLogTypes.started
            ).toBeTruthy();
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
        expect(getState().currentPhase === currentPhases.running).toBeTruthy();
        expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();
      });

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });

      await rerender();
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();
      expect(
        getState().lastActionType === getGdprQueryScopesAction.type
      ).toBeTruthy();
      expect(getState().lastLogType === actionLogTypes.started).toBeTruthy();

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        getGdprQueryScopesAction.type,
        tunnistamoRedirectionInitializationAction.type
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        isLoading: true,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        tunnistamoRedirectionInitializationAction.type,
        tunnistamoAuthCodeRedirectionAction.type
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(
        getState().nextPhase === nextPhases.waitForAuthCodeRedirect
      ).toBeTruthy();

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
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();

      await checkCurrentActionAndManuallyCompleteIt(
        tunnistamoAuthCodeParserAction.type,
        loadKeycloakConfigAction.type
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();

      await checkCurrentActionAndManuallyCompleteIt(
        loadKeycloakConfigAction.type,
        keycloakRedirectionInitializationAction.type
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();

      await checkCurrentActionAndManuallyCompleteIt(
        keycloakRedirectionInitializationAction.type,
        keycloakAuthCodeRedirectionAction.type
      );

      await rerender();

      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(
        getState().nextPhase === nextPhases.waitForAuthCodeRedirect
      ).toBeTruthy();

      await checkCurrentActionAndManuallyCompleteIt(
        keycloakAuthCodeRedirectionAction.type,
        keycloakAuthCodeCallbackUrlAction.type
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.resumeCallback).toBeTruthy();

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        // note: this is false, because queue is not idle shouldHandleCallback: true,
        isLoading: true,
      });

      await checkCurrentActionAndManuallyCompleteIt(
        keycloakAuthCodeCallbackUrlAction.type,
        keycloakAuthCodeParserAction.type
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();

      await checkCurrentActionAndManuallyCompleteIt(
        keycloakAuthCodeParserAction.type,
        defaultRedirectorActionType
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();

      await checkCurrentActionAndManuallyCompleteIt(
        defaultRedirectorActionType,
        defaultRedirectionCatcherActionType
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(
        getState().nextPhase === nextPhases.redirectBackToStartPage
      ).toBeTruthy();

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

      expect(getState().currentPhase === currentPhases.idle).toBeTruthy();
      expect(
        getState().nextPhase === nextPhases.resumeWithAuthCodes
      ).toBeTruthy();

      expect(getFunctionResults()).toMatchObject({
        ...hookFunctionResultsAsFalse,
        shouldResumeDownload: true,
      });
      resume();
      await checkCurrentActionAndManuallyCompleteIt(
        defaultRedirectionCatcherActionType,
        getDownloadDataAction.type
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();

      await checkCurrentActionAndManuallyCompleteIt(
        getDownloadDataAction.type,
        downloadAsFileAction.type
      );
      expect(getState().currentPhase === currentPhases.running).toBeTruthy();
      expect(getState().nextPhase === nextPhases.waitForAction).toBeTruthy();

      await checkCurrentActionAndManuallyCompleteIt(downloadAsFileAction.type);
      await waitFor(async () => {
        expect(getState().currentPhase === currentPhases.complete).toBeTruthy();
        expect(getState().nextPhase === nextPhases.restart).toBeTruthy();
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
});
