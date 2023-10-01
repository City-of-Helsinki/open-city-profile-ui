import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Action,
  ActionQueue,
  ActionType,
  InitialQueue,
  QueueController,
  mergeQueues,
  verifyQueuesMatch,
} from './actionQueue';
import {
  LogType,
  Logger,
  RunnerFunctions,
  createActionQueueRunner,
  isGenericError,
} from './actionQueueRunner';
import { getStoredQueue, storeQueue } from './actionQueueStorage';

export type QueueState = {
  lastActionType: ActionType | undefined;
  lastLogType: LogType | undefined;
  isComplete: boolean;
  hasError: boolean;
  isActive: boolean;
};

export type HookFunctions = {
  isValid: () => boolean;
  dispose: () => void;
  reset: () => void;
  getQueueRunner: () => RunnerFunctions;
  state: QueueState;
};

export function useActionQueue(
  initialQueueProps: InitialQueue,
  storageKey?: string
): HookFunctions {
  const [, update] = useState(0);
  const queueStateRef = useRef<QueueState>({
    lastActionType: undefined,
    lastLogType: undefined,
    isComplete: false,
    hasError: false,
    isActive: false,
  });

  const functionsHaveBeenMemoized = useRef<boolean>(false);

  const forceRerender = useCallback(() => {
    update(num => num + 1);
  }, [update]);

  const functions = useMemo(() => {
    if (functionsHaveBeenMemoized.current) {
      throw new Error(
        'useActionQueue useMemo() was called twice. Passed "initialQueueProps" MUST BE memoized to avoid this.'
      );
    }
    functionsHaveBeenMemoized.current = true;

    const storageFunctions = {
      getFromStorage: () => {
        if (!storageKey) {
          return undefined;
        }
        return getStoredQueue(storageKey);
      },
      setToStorage: (queue: ActionQueue) => {
        if (!storageKey) {
          return false;
        }
        return storeQueue(storageKey, queue);
      },
    };

    const getNewState = (
      controller: QueueController,
      type?: LogType,
      action?: Action
    ): QueueState => {
      const newState = {
        ...queueStateRef.current,
      };
      if (controller.getFailed()) {
        newState.hasError = true;
      }
      if (controller.isFinished()) {
        newState.isComplete = true;
      }
      if (action) {
        if (type === 'started') {
          newState.lastActionType = action.type;
          newState.isActive = true;
        }
        if (type === 'completed' || type === 'error') {
          newState.isActive = false;
        }
      }
      if (type && (type === 'error' || isGenericError(type))) {
        newState.hasError = true;
      }
      newState.lastLogType = type;
      return newState;
    };

    const logger: Logger = (type, action, controller) => {
      queueStateRef.current = getNewState(controller, type, action);
      storageFunctions.setToStorage(controller.getQueue());
      forceRerender();
    };

    const resolveQueue = (primaryQueue: InitialQueue) => {
      const storedQueue = storageFunctions.getFromStorage();
      if (!storedQueue) {
        return primaryQueue;
      }
      if (!verifyQueuesMatch(primaryQueue, storedQueue)) {
        return primaryQueue;
      }
      return mergeQueues(primaryQueue, storedQueue).map(props => {
        // A stored action can, and probably will, have active: true,
        // but none of the actions can be in active state when queue is initiated.
        // If an action is active, getNext() can return wrong action
        // Action should only be active when its executor have been called and it is pending.
        props.active = false;
        return props;
      });
    };

    const runner = createActionQueueRunner(
      resolveQueue(initialQueueProps) as InitialQueue,
      logger
    );
    const dispose = () => {
      runner.dispose();
    };
    const reset = () => {
      runner.reset();
    };

    const isValid: HookFunctions['isValid'] = () =>
      runner.getQueue().length > 0;

    queueStateRef.current = getNewState(runner);
    return {
      getQueueRunner: () => runner,
      dispose,
      isValid,
      reset,
    };
  }, [initialQueueProps, forceRerender, storageKey]);

  useEffect(
    () => () => {
      functions.getQueueRunner().dispose();
    },
    [functions]
  );
  return {
    ...functions,
    state: queueStateRef.current,
  };
}
