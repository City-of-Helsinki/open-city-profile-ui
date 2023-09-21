import { useEffect, useMemo, useRef } from 'react';

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

export type ActionType = string;

export type ActionExecutor = (
  action: Action,
  functions: QueueFunctions
) => Promise<unknown>;

export type ActionProps = {
  type: ActionType;
  executor: ActionExecutor;
  options?: ActionOptions;
};
export type ActionOptions = {
  noStorage?: boolean;
  syncronousCompletion?: boolean;
  idleWhenActive?: boolean;
};

export type ActionUpdateProps = {
  updatedAt: number;
  complete: boolean;
  active: boolean;
  result?: unknown;
  errorMessage?: string;
};

export type Action = ActionProps & ActionUpdateProps;

type StoredAction = Omit<Action, 'executor'>;

type ActionFilter = (action: Action) => boolean;

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
export const MAX_LIFETIME_IN_MS = 60 * 1000;

function restore(
  storedProps: StoredAction | Action,
  props: Partial<ActionProps | ActionUpdateProps>
): Action {
  return {
    ...storedProps,
    ...props,
  } as Action;
}

function invalidate(action: Action): Action {
  action.updatedAt = -1;
  action.executor = () => {
    throw new Error('This queue item is invalidated');
  };
  action.type = '';
  action.complete = false;
  action.active = false;
  action.errorMessage = 'invalidated';
  action.result = undefined;
  action.options = undefined;
  return action;
}

function createAction(props: ActionProps): Action {
  return {
    ...props,
    updatedAt: Date.now(),
    complete: false,
    active: false,
  };
}

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

function hasOnlyActionProps(action: ActionProps | Action) {
  return typeof Reflect.get(action, 'complete') === 'undefined';
}

function mergeQueues(
  currentQueue: ActionQueue,
  updateValues: ActionQueue | InitialQueue
) {
  console.log('mergeQueues');
  console.log('currentQueue', currentQueue);
  console.log('updateValues', updateValues);
  if (!!currentQueue.length && currentQueue.length !== updateValues.length) {
    throw new Error('Queue update does not match current queue length');
  }
  const uniqueTypes = new Set<ActionType>();
  const verifyTypeDoesNotExist = (type: ActionType) => {
    if (uniqueTypes.has(type)) {
      throw new Error(`Action types must be unique. Found ${type}`);
    }
    uniqueTypes.add(type);
  };
  const verifyAndReturnAction = (action: Action) => {
    verifyTypeDoesNotExist(action.type);
    if (hasOnlyActionProps(action)) {
      console.log('assingn as parital', action);
      throw new Error('Given action is a partial');
    }
    return action;
  };
  const isUpdate = currentQueue.length;
  const primaryQueue = isUpdate ? currentQueue : updateValues;
  return primaryQueue.map((item, index) => {
    const newProps = updateValues[index];
    if (!newProps || newProps.type !== item.type) {
      throw new Error(
        `Updated queue types mismatch at index ${index}. Type #${item.type} vs ${newProps?.type}`
      );
    }
    return verifyAndReturnAction(
      isUpdate ? restore(item as Action, newProps) : createAction(item)
    );
  });
}

function restoreOrCreateQueue(initialQueueProps: InitialQueue): ActionQueue {
  const queue = getStoredQueue();
  return mergeQueues(queue || [], initialQueueProps);
  /*
  if (queue) {
    return queue.map((item, index) => {
      const initialProps = initialQueueProps[index];
      if (!initialProps || initialProps.type !== item.type) {
        throw new Error(
          `Restored queue types mismatch at index ${index}. Type #${item.type} vs ${initialProps?.type}`
        );
      }
      return verifyAndReturnAction(restore(item, initialProps));
    });
  }

  const newQueue: ActionQueue = initialQueueProps.map(props =>
    verifyAndReturnAction(createAction(props))
  );
  storeQueue(newQueue);
  return newQueue;
  */
}
/*
const getByActionType = (queue: ActionQueue, type: ActionType) =>
  queue.find(data => data.type === type);

function getNextAction(queue: ActionQueue): Action | undefined {
  return queue.filter(data => !data.complete)[0];
}

function hasExpired(queue: ActionQueue) {
  const now = Date.now();
  return queue.some(data => data.updatedAt + MAX_LIFETIME_IN_MS >= now);
}

function getActionIndex(queue: ActionQueue, action: ActionType) {
  return queue.findIndex(data => data.type === action);
}

function getActiveAction(queue: ActionQueue) {
  return queue.filter(data => !!data.active && !data.complete)[0];
}
*/

const activeFilter: ActionFilter = action => action.active;
const idleFilter: ActionFilter = action => {
  if (action.complete) {
    return false;
  }
  const isIdleWhenActive = !!action.options && !!action.options.idleWhenActive;
  return !action.active || isIdleWhenActive;
};
const completeFilter: ActionFilter = action => action.complete;
const errorFilter: ActionFilter = action =>
  action.complete && !!action.errorMessage;
const nextFilter: ActionFilter = action => !completeFilter(action);

function createQueue(initialQueue: ActionQueue): QueueFunctions {
  let queue: ActionQueue = initialQueue;
  const filterQueue = (f: ActionFilter): Action[] => queue.filter(f);
  const getByType = (type: ActionType) => queue.filter(f => f.type === type)[0];
  const getFirstIdle = () => queue.find(idleFilter);

  return {
    getQueue: () => queue,
    getByType,
    getActive: () => filterQueue(activeFilter)[0],
    getComplete: () => filterQueue(completeFilter),
    getNext: () => filterQueue(nextFilter)[0],
    getFailed: () => filterQueue(errorFilter)[0],
    getResult: (type: ActionType) => {
      const item = getByType(type);
      return item && item.complete ? item.result : undefined;
    },
    clean: () => {
      queue.forEach(item => invalidate(item));
      queue = [];
    },
    updateActionAndQueue: (
      type: ActionType,
      props: Partial<ActionUpdateProps>
    ) => {
      const item = getByType(type);
      if (!item) {
        throw new Error(
          `Unable to update item. Item of type ${type} not found.`
        );
      }
      const newQueue = queue.map(action => {
        if (action.type === type) {
          return restore(item, { ...props, updatedAt: Date.now() });
        } else {
          return { ...action };
        }
      });
      queue.map(invalidate);
      queue = newQueue;
    },
    isValid: () => queue.length > 0,
    reset: () => {
      const resetProps = {
        updatedAt: Date.now(),
        complete: false,
        active: false,
        result: undefined,
        errorMessage: undefined,
      };
      const newQueue = queue.map(item => restore(item, resetProps));
      queue.map(invalidate);
      queue = newQueue;
    },
    isComplete: () => filterQueue(completeFilter).length === queue.length,
    getFirstIdle,
    canStartFrom: (type: ActionType) => {
      const idle = getFirstIdle();
      return !!idle && idle.type === type;
    },
  };
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
      console.log('startFrom', startFrom, queueFunctions.getQueue());
      const currentlyActive = queueFunctions.getActive();
      if (currentlyActive) {
        if (startFrom && currentlyActive.type !== startFrom) {
          throw new Error(
            `Assumed to start from action ${startFrom}. Another action is active: ${currentlyActive.type}`
          );
        }
        console.log('currentlyActive', currentlyActive);
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
