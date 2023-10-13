import { useCallback, useMemo, useRef } from 'react';

import {
  QueueState,
  useActionQueue,
} from '../common/actionQueue/useActionQueue';
import {
  canResumeWithRedirectionCatcher,
  resumeQueueFromRedirectionCatcher,
} from './actions/redirectionHandlers';
import { isQueueWaitingForAuthCodeRedirection } from './actions/authCodeRedirectionHandler';
import {
  createPagePathWithFailedActionParams,
  isGdprCallbackUrl,
  useInternalRedirect,
} from './actions/utils';
import {
  resumeQueueFromNextCallbackDetector,
  shouldResumeWithAuthCodeCallback,
} from './actions/authCodeCallbackUrlDetector';
import {
  actionLogTypes,
  isGenericError,
} from '../common/actionQueue/actionQueueRunner';
import { getQueue } from './actions/queues';
import { storeQueue } from '../common/actionQueue/actionQueueStorage';
import config from '../config';

export type CurrentPhase = keyof typeof currentPhases;

export const currentPhases = {
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
  redirectBackToStartPage: 'redirectBackToStartPage',
} as const;

export type QueueComponentState = QueueState & {
  currentPhase?: CurrentPhase;
  nextPhase?: NextPhase;
};

function useAuthCodeQueues(): {
  canStart: () => boolean;
  startOrRestart: () => void;
  shouldRestart: () => boolean;
  shouldResumeWithAuthCodes: () => boolean;
  shouldHandleCallback: () => boolean;
  resume: () => boolean;
  hasError: boolean;
  isLoading: boolean;
  state: QueueComponentState;
} {
  const queueComponentState = useRef<QueueComponentState>({
    isComplete: false,
    hasError: false,
    isActive: false,
    lastActionType: undefined,
    lastLogType: undefined,
    currentPhase: undefined,
    nextPhase: undefined,
  });

  const storageKey = 'downloadProfileQueue';
  const path = config.downloadPath;
  const queueName = 'downloadProfile';
  const queue = useMemo(() => getQueue(queueName, path), [queueName, path]);
  const queueHookProps = useActionQueue(queue, storageKey);
  const { state } = queueHookProps;
  const queueRunner = queueHookProps.getQueueRunner();
  const internalRedirections = useInternalRedirect(queueRunner);

  /**
   * Current phases:
   * - idle: not action is running / active
   * - error: an action has failed
   * - complete: all actions are complete or one has failed.
   */

  const resolveCurrentPhase = useCallback(
    (targetState: QueueState): CurrentPhase => {
      if (targetState.lastLogType === actionLogTypes.error) {
        return currentPhases.error;
      }
      if (targetState.lastLogType && isGenericError(targetState.lastLogType)) {
        return currentPhases.error;
      }

      if (targetState.isComplete) {
        return 'complete';
      }

      return targetState.isActive ? currentPhases.running : currentPhases.idle;
    },
    []
  );

  /**
   * Next possible phases:
   * - waitForAction: non-essential action is running
   * - resumeWithAuthCodes: authcodes are fetched, resume from next action (redirectionCatcher)
   * - resumeCallback: the browser has returned from oidc server and queue should be resumed
   * - stoppedInMidQueue: queue is stopped in non-essential action. After the queue was restored from storage.
   * - restart: an action has failed and user should restart it
   * - start: user should start the queue
   * - waitForAuthCodeRedirect: there is a redirection to the oidc server on-going
   * - waitForInternalRedirect: there is a redirection on-going (other that listed above)
   * - redirectBackToStartPage: user should be (and will be) redirected back to the page where auth codes are needed.
   */

  const resolveNextPhase = useCallback(
    (currentPhase: CurrentPhase): NextPhase => {
      if (currentPhase === currentPhases.complete) {
        return nextPhases.restart;
      }
      const isOnGrprCallbackPage = isGdprCallbackUrl();
      if (currentPhase !== currentPhases.error) {
        if (isQueueWaitingForAuthCodeRedirection(queueRunner)) {
          // eslint-disable-next-line sonarjs/no-duplicate-string
          return nextPhases.waitForAuthCodeRedirect;
        }

        if (canResumeWithRedirectionCatcher(queueRunner)) {
          return isOnGrprCallbackPage
            ? nextPhases.redirectBackToStartPage
            : nextPhases.resumeWithAuthCodes;
        }
        if (shouldResumeWithAuthCodeCallback(queueRunner)) {
          return isOnGrprCallbackPage
            ? nextPhases.resumeCallback
            : nextPhases.stoppedInMidQueue;
        }
      }
      if (internalRedirections.check()) {
        return nextPhases.waitForInternalRedirect;
      }
      if (currentPhase === currentPhases.idle) {
        if (queueRunner.getComplete().length) {
          return nextPhases.stoppedInMidQueue;
        }
        return nextPhases.start;
      }
      if (currentPhase === currentPhases.error) {
        return isOnGrprCallbackPage
          ? nextPhases.redirectBackToStartPage
          : nextPhases.restart;
      }
      return nextPhases.waitForAction;
    },
    [queueRunner, internalRedirections]
  );

  const handleChange = useCallback(
    (newState: QueueState) => {
      const currentPhase = resolveCurrentPhase(newState);
      const nextPhase = resolveNextPhase(currentPhase);

      if (nextPhase === nextPhases.redirectBackToStartPage) {
        // if a redirection is stored in a result, use it
        if (!internalRedirections.check()) {
          internalRedirections.redirect(
            createPagePathWithFailedActionParams(path, queueRunner.getFailed())
          );
        }
      }
      if (newState.isComplete && !queueComponentState.current.isComplete) {
        storeQueue(storageKey, null);
      }

      queueComponentState.current = {
        ...queueComponentState.current,
        ...newState,
        currentPhase,
        nextPhase,
      };
    },
    [
      resolveCurrentPhase,
      resolveNextPhase,
      internalRedirections,
      queueRunner,
      path,
    ]
  );

  handleChange(state);

  const startOrRestart = useCallback(() => {
    internalRedirections.reset();
    queueHookProps.reset();
    queueRunner.start();
  }, [queueRunner, queueHookProps, internalRedirections]);

  const canStart = () =>
    queueComponentState.current.currentPhase === 'idle' &&
    queueComponentState.current.nextPhase === nextPhases.start;

  const shouldRestart = () =>
    queueComponentState.current.nextPhase === nextPhases.restart ||
    (queueComponentState.current.currentPhase === 'idle' &&
      queueComponentState.current.nextPhase === nextPhases.stoppedInMidQueue);

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

  const resume = () => resumeWithAuthCodes() || resumeGdprCallback();

  const shouldResumeWithAuthCodes = () =>
    queueComponentState.current.nextPhase === nextPhases.resumeWithAuthCodes;

  const shouldHandleCallback = () =>
    queueComponentState.current.currentPhase === 'idle' &&
    queueComponentState.current.nextPhase === nextPhases.resumeCallback;

  return {
    startOrRestart,
    resume,
    canStart,
    shouldRestart,
    shouldResumeWithAuthCodes,
    shouldHandleCallback,
    hasError: queueComponentState.current.hasError,
    isLoading:
      queueComponentState.current.currentPhase === currentPhases.running,
    state: queueComponentState.current,
  };
}

export default useAuthCodeQueues;
