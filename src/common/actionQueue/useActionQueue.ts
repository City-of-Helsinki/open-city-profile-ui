import { useMemo } from 'react';

import {
  mergeQueues,
  createQueue,
  Action,
  ActionProps,
  ActionType,
  ActionUpdateProps,
  ActionExecutor,
} from './actionQueue';

type LogType = 'started' | 'completed' | 'error';

export type Logger = (
  type: LogType,
  action: Action,
  queueFunctions: QueueFunctions
) => void;

export type HookCallback = (
  action: Action,
  queueFunctions: QueueFunctions
) => void;

export type InitialQueue = ActionProps[];
export type ActionQueue = Action[];
export type QueueFunctions = {
  getNext: () => Action | undefined;
  getActive: () => Action | undefined;
  getFailed: () => Action | undefined;
  getFirstIdle: () => Action | undefined;
  getQueue: () => ActionQueue;
  getResult: (type: ActionType) => unknown;
  getByType: (type: ActionType) => Action | undefined;
  getComplete: (type: ActionType) => Action[];
  clean: () => void;
  reset: () => void;
  updateActionAndQueue: (
    type: ActionType,
    props: Partial<ActionUpdateProps>
  ) => void;
  isValid: () => boolean;
  isComplete: () => boolean;
  canStartFrom: (type: ActionType) => boolean;
};

export type HookFunctions = QueueFunctions & {
  isValid: () => boolean;
  execute: (action: Action) => void;
  cleanUp: () => void;
  start: (startFrom?: ActionType) => Action | undefined;
  reset: () => void;
  getPromise: () => Promise<unknown> | undefined;
};

export const STORAGE_KEY = 'GDPR_QUEUE';

function getStoredQueue(): ActionQueue | undefined {
  const queue = sessionStorage.getItem(STORAGE_KEY);
  try {
    return queue ? JSON.parse(queue) : undefined;
  } catch (e) {
    return undefined;
  }
}

function createStorageVersion(queue: ActionQueue) {
  return JSON.stringify(
    queue.map(action => {
      // "executor" is picked so it won't be in "rest"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { options, result, executor, ...rest } = action;

      const storageResult = options && options.noStorage ? undefined : result;
      return {
        ...rest,
        options,
        result: storageResult,
      };
    })
  );
}

function storeQueue(queue: ActionQueue | null) {
  try {
    if (!queue) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, createStorageVersion(queue));
    }
    return true;
  } catch (e) {
    return false;
  }
}

function restoreOrCreateQueue(initialQueueProps: InitialQueue): ActionQueue {
  const queue = getStoredQueue();
  return mergeQueues(queue || [], initialQueueProps);
}

export function useActionQueue(
  initialQueueProps: InitialQueue,
  logger: Logger = () => undefined
): HookFunctions {
  const functions = useMemo(() => {
    let pendingPromise: Promise<unknown> | undefined = undefined;
    let isCleanedUp = false;
    const rebuiltQueue = restoreOrCreateQueue(initialQueueProps);
    const queueFunctions = createQueue(rebuiltQueue);

    const updateQueue = (
      actionProps: Action,
      updateProps: Partial<ActionUpdateProps>
    ) => {
      const { type } = actionProps;
      queueFunctions.updateActionAndQueue(type, updateProps);
      storeQueue(queueFunctions.getQueue());
    };

    const execute = (action: Action) => {
      const promise = action.executor({ ...action }, queueFunctions);
      pendingPromise = promise;
      const type = String(action.type);
      const getUpToDateAction = () => queueFunctions.getByType(type) as Action;

      const closeImmediately = !!(
        action.options && action.options.syncronousCompletion
      );
      updateQueue(action, {
        active: !closeImmediately,
        complete: closeImmediately,
      });
      logger('started', getUpToDateAction(), queueFunctions);

      const completeAction = (
        resultOrError: Pick<ActionUpdateProps, 'errorMessage' | 'result'>
      ) => {
        updateQueue(getUpToDateAction(), {
          ...resultOrError,
          complete: true,
          active: false,
        });
        const logType: LogType = resultOrError.errorMessage
          ? 'error'
          : 'completed';
        logger(logType, getUpToDateAction(), queueFunctions);
      };

      promise
        .then(value => {
          if (isCleanedUp) {
            return;
          }
          completeAction({ result: value });
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          executeNext();
        })
        .catch(e => {
          if (isCleanedUp) {
            return;
          }

          completeAction({
            errorMessage:
              e instanceof Error
                ? e.message
                : `Unknown error ${e ? e.toString() : ''}`,
          });
        });
      return promise;
    };

    const executeNext = () => {
      const active = queueFunctions.getActive();
      if (active) {
        return;
      }
      const next = queueFunctions.getNext();
      if (next) {
        execute(next);
      }
    };

    const start = (startFrom?: ActionType) => {
      const currentlyActive = queueFunctions.getActive();
      if (currentlyActive) {
        if (startFrom && currentlyActive.type !== startFrom) {
          throw new Error(
            `Assumed to start from action ${startFrom}. Another action is active: ${currentlyActive.type}`
          );
        }
        execute(currentlyActive);
        return currentlyActive;
      }
      const nextAction = queueFunctions.getNext();
      if (startFrom) {
        if (nextAction && nextAction.type !== startFrom) {
          throw new Error(
            `Assumed to start from action ${startFrom}. Next action is: ${nextAction.type}`
          );
        }
        if (!nextAction) {
          throw new Error(
            `Cannot start from ${startFrom}. No next action available`
          );
        }
      }
      if (nextAction) {
        execute(nextAction);
      }
      return queueFunctions.getActive();
    };

    const cleanUp = () => {
      if (isCleanedUp) {
        return;
      }
      pendingPromise = undefined;
      isCleanedUp = true;
      queueFunctions.clean();
      storeQueue(null);
    };

    const isValid: HookFunctions['isValid'] = () =>
      !!queueFunctions.isValid() && !isCleanedUp;

    return {
      ...queueFunctions,
      execute,
      start,
      cleanUp,
      isValid,
      getPromise: () => pendingPromise,
    };
  }, [initialQueueProps, logger]);

  return functions;
}

export const createActionQueueCompleteExecutor: () => ActionExecutor = () => (
  action,
  functions
) => {
  const queueWithoutSelf = functions.getQueue().slice(0, -1);
  const results = queueWithoutSelf.map(queueAction => {
    if (typeof queueAction.result === 'object') {
      return { ...queueAction.result };
    }
    return queueAction.result;
  });
  return Promise.resolve(results);
};
