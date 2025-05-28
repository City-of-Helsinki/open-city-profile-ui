import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  QueueState,
  useActionQueue,
} from '../common/actionQueue/useActionQueue';
import {
  isResumableRedirectionCatcher,
  resumeQueueFromRedirectionCatcher,
} from './actions/redirectionHandlers';
import { isQueueWaitingForAuthCodeRedirection } from './actions/authCodeRedirectionHandler';
import { useInternalRedirect } from './actions/utils';
import {
  isResumableGdprCallback,
  resumeQueueFromNextCallbackDetector,
} from './actions/authCodeCallbackUrlDetector';
import {
  actionLogTypes,
  isGenericError,
} from '../common/actionQueue/actionQueueRunner';
import { QueueProps, getQueue } from './actions/queues';
import { storeQueue } from '../common/actionQueue/actionQueueStorage';
import {
  Action,
  QueueController,
  isResumable,
} from '../common/actionQueue/actionQueue';

export type RunningStatus = keyof typeof runningStatuses;

export const runningStatuses = {
  idle: 'idle',
  running: 'running',
  error: 'error',
  complete: 'complete',
} as const;

export type NextPhase = keyof typeof nextPhases;

export const nextPhases = {
  waitForAction: 'waitForAction',
  resumeWithAuthCodes: 'resumeWithAuthCodes',
  resumeCallback: 'resumeCallback',
  stoppedInMidQueue: 'stoppedInMidQueue',
  restart: 'restart',
  start: 'start',
  waitForInternalRedirect: 'waitForInternalRedirect',
  waitForAuthCodeRedirect: 'waitForAuthCodeRedirect',
} as const;

export type QueueComponentState = QueueState & {
  runningStatus?: RunningStatus;
  nextPhase?: NextPhase;
};

export type AuthCodeQueuesProps = {
  onCompleted?: (controller: QueueController, state: QueueState) => void;
  onError?: (controller: QueueController, state: QueueState) => void;
} & QueueProps;

export const authCodeQueuesStorageKey = 'authCodeQueue';

function useAuthCodeQueues({
  startPagePath,
  serviceName,
  queueName,
  language,
  onCompleted,
  onError,
}: AuthCodeQueuesProps): {
  canStart: () => boolean;
  startOrRestart: () => void;
  shouldRestart: () => boolean;
  shouldResumeWithAuthCodes: () => boolean;
  shouldHandleCallback: () => boolean;
  resume: () => boolean;
  hasError: boolean;
  isComplete: boolean;
  isLoading: boolean;
  state: QueueComponentState;
} {
  const queueComponentState = useRef<QueueComponentState>({
    isComplete: false,
    hasError: false,
    isActive: false,
    lastActionType: undefined,
    lastLogType: undefined,
    runningStatus: undefined,
    nextPhase: undefined,
  });

  // Add reactive state to ensure component re-renders on state changes
  const [reactiveState, setReactiveState] = useState({
    hasError: queueComponentState.current.hasError || false,
    isComplete: queueComponentState.current.isComplete || false,
    isLoading:
      queueComponentState.current.runningStatus === runningStatuses.running,
  });

  const queue = useMemo(
    () => getQueue({ startPagePath, serviceName, queueName, language }),
    [startPagePath, serviceName, queueName, language]
  );
  const queueHookProps = useActionQueue(queue, authCodeQueuesStorageKey);
  const { state } = queueHookProps;
  const queueRunner = queueHookProps.getQueueRunner();
  const internalRedirections = useInternalRedirect(queueRunner);

  /**
   * Current phases:
   * - idle: not action is running / active
   * - error: an action has failed
   * - complete: all actions are complete or one has failed.
   */

  const resolverunningStatus = useCallback(
    (targetState: QueueState): RunningStatus => {
      if (targetState.lastLogType === actionLogTypes.error) {
        return runningStatuses.error;
      }
      if (targetState.lastLogType && isGenericError(targetState.lastLogType)) {
        return runningStatuses.error;
      }

      if (targetState.isComplete) {
        return 'complete';
      }

      return targetState.isActive
        ? runningStatuses.running
        : runningStatuses.idle;
    },
    []
  );

  /**
   * Next possible phases:
   * - waitForAction: non-essential action is running
   * - resumeWithAuthCodes: authcodes are fetched, resume from next action (redirectionCatcher)
   * - resumeCallback: the browser has returned from oidc server and queue should be resumed
   * - stoppedInMidQueue: queue is stopped in some non-essential action.
   * - restart: an action has failed and user should restart it
   * - start: user should start the queue
   * - waitForAuthCodeRedirect: there is a redirection to the oidc server on-going
   * - waitForInternalRedirect: there is internal redirection in action
   */

  const resolveNextPhase = useCallback(
    (currentRunningStatus: RunningStatus): NextPhase => {
      if (currentRunningStatus === runningStatuses.complete) {
        return nextPhases.restart;
      }
      const next = queueRunner.getNext();
      const couldResume = !!next && currentRunningStatus === 'idle';
      const isNextResumable = couldResume ? isResumable(next) : false;
      if (isNextResumable) {
        if (isResumableGdprCallback(next as Action)) {
          return nextPhases.resumeCallback;
        }
        if (isResumableRedirectionCatcher(next as Action)) {
          return nextPhases.resumeWithAuthCodes;
        }
      }
      if (internalRedirections.check()) {
        return nextPhases.waitForInternalRedirect;
      }
      if (currentRunningStatus === runningStatuses.error) {
        return nextPhases.restart;
      }
      if (isQueueWaitingForAuthCodeRedirection(queueRunner)) {
        return nextPhases.waitForAuthCodeRedirect;
      }

      if (currentRunningStatus === runningStatuses.idle) {
        if (queueRunner.getComplete().length) {
          return nextPhases.stoppedInMidQueue;
        }
        return nextPhases.start;
      }

      return nextPhases.waitForAction;
    },
    [queueRunner, internalRedirections]
  );

  const handleChange = useCallback(
    (newState: QueueState) => {
      const currentRunningStatus = resolverunningStatus(newState);
      const nextPhase = resolveNextPhase(currentRunningStatus);
      const oldIsComplete = queueComponentState.current.isComplete;

      queueComponentState.current = {
        ...queueComponentState.current,
        ...newState,
        runningStatus: currentRunningStatus,
        nextPhase,
      };

      if (queueComponentState.current.isComplete && !oldIsComplete) {
        storeQueue(authCodeQueuesStorageKey, null);
        const callback = newState.hasError ? onError : onCompleted;
        if (callback) {
          callback(queueRunner, newState);
        }
      }

      // Update reactive state to trigger component re-renders
      setReactiveState({
        hasError: queueComponentState.current.hasError || false,
        isComplete: queueComponentState.current.isComplete || false,
        isLoading:
          queueComponentState.current.runningStatus === runningStatuses.running,
      });
    },
    [resolverunningStatus, resolveNextPhase, queueRunner, onCompleted, onError]
  );

  // Move state update to useEffect to prevent it from running on every render
  useEffect(() => {
    handleChange(state);
  }, [state, handleChange]);

  const startOrRestart = useCallback(() => {
    internalRedirections.reset();
    queueHookProps.reset();
    queueRunner.start();
  }, [queueRunner, queueHookProps, internalRedirections]);

  const canStart = useCallback(() => {
    const { runningStatus, nextPhase } = queueComponentState.current;
    return runningStatus === 'idle' && nextPhase === nextPhases.start;
  }, []);

  const shouldRestart = useCallback(() => {
    const { runningStatus, nextPhase } = queueComponentState.current;
    return (
      nextPhase === nextPhases.restart ||
      (runningStatus === 'idle' && nextPhase === nextPhases.stoppedInMidQueue)
    );
  }, []);

  const resumeGdprCallback = useCallback(() => {
    if (queueComponentState.current.nextPhase !== nextPhases.resumeCallback) {
      return false;
    }
    return !!resumeQueueFromNextCallbackDetector(queueRunner);
  }, [queueRunner]);

  const resumeWithAuthCodes = useCallback(() => {
    if (
      queueComponentState.current.nextPhase !== nextPhases.resumeWithAuthCodes
    ) {
      return false;
    }
    return resumeQueueFromRedirectionCatcher(queueRunner);
  }, [queueRunner]);

  const resume = useCallback(
    () => resumeWithAuthCodes() || resumeGdprCallback(),
    [resumeWithAuthCodes, resumeGdprCallback]
  );

  const shouldResumeWithAuthCodes = useCallback(() => {
    const { nextPhase } = queueComponentState.current;
    return nextPhase === nextPhases.resumeWithAuthCodes;
  }, []);

  const shouldHandleCallback = useCallback(() => {
    const { runningStatus, nextPhase } = queueComponentState.current;
    return runningStatus === 'idle' && nextPhase === nextPhases.resumeCallback;
  }, []);

  // Create the return value with stable callbacks and the reactive state
  return useMemo(
    () => ({
      startOrRestart,
      resume,
      canStart,
      shouldRestart,
      shouldResumeWithAuthCodes,
      shouldHandleCallback,
      hasError: reactiveState.hasError,
      isComplete: reactiveState.isComplete,
      isLoading: reactiveState.isLoading,
      state: queueComponentState.current,
    }),
    [
      startOrRestart,
      resume,
      canStart,
      shouldRestart,
      shouldResumeWithAuthCodes,
      shouldHandleCallback,
      reactiveState.hasError,
      reactiveState.isComplete,
      reactiveState.isLoading,
    ]
  );
}

export default useAuthCodeQueues;
