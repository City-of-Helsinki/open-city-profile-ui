import {
  Action,
  ActionProps,
  ActionType,
  ActionUpdateProps,
  ActionExecutorPromise,
  QueueController,
  createQueueController,
  createQueueFromProps,
  getOption,
} from './actionQueue';

export type GenericErrorType = keyof typeof genericErrorTypes;
export type ActionLogType = keyof typeof actionLogTypes;
export type LogType = ActionLogType | GenericErrorType;

// logged when an action cannot be executed
export const genericErrorTypes = {
  CANNOT_EXECUTE_ACTION_IS_ACTIVE: 'CANNOT_EXECUTE_ACTION_IS_ACTIVE',
  CANNOT_EXECUTE_ACTION_IS_NOT_NEXT: 'CANNOT_EXECUTE_ACTION_IS_NOT_NEXT',
  CANNOT_EXECUTE_ACTION_IS_INVALID: 'CANNOT_EXECUTE_ACTION_IS_INVALID',
  CANNOT_EXECUTE_ANOTHER_ACTION_IS_ACTIVE:
    'CANNOT_EXECUTE_ANOTHER_ACTION_IS_ACTIVE',
  CANNOT_EXECUTE_ACTION_IS_COMPLETE: 'CANNOT_EXECUTE_ACTION_IS_COMPLETE',
  UNKNOWN_ACTION_TYPE: 'UNKNOWN_ACTION_TYPE',
} as const;

// logged when an action is executed and when execution is ended or actions are reset.
export const actionLogTypes = {
  started: 'started',
  completed: 'completed',
  error: 'error',
  reset: 'reset',
} as const;

export type Logger = (
  type: LogType,
  action: Action | undefined,
  queueController: QueueController
) => void;

export type InitialQueue = ActionProps[];
export type ActionStatus =
  | 'next'
  | 'complete'
  | 'active'
  | 'pending'
  | 'invalid'
  // another action is active
  | 'in-queue'
  // another action is next
  | 'not-next'
  | 'unknown';

export type RunnerFunctions = QueueController & {
  dispose: () => void;
  start: () => Action | void;
  resume: (startFrom: ActionType) => Action | void;
  reset: () => void;
  getPromise: () => ActionExecutorPromise | undefined;
  getActionStatus: (actionOrActionType: ActionType | Action) => ActionStatus;
};

export function isGenericError(loggedType: LogType) {
  return Object.keys(genericErrorTypes).includes(loggedType);
}

export function getActionType(
  typeOrAction: Action | ActionProps | ActionType
): ActionType {
  return typeof typeOrAction === 'string' ? typeOrAction : typeOrAction.type;
}

export function canQueueContinueFrom(
  runner: RunnerFunctions,
  actionOrType: Action | ActionType,
  acceptPending = false
): boolean {
  const status = runner.getActionStatus(actionOrType);
  return status === 'next' || (acceptPending && status === 'pending');
}

export const resumeQueueFromAction = (
  runner: RunnerFunctions,
  actionOrType: Action | ActionType
) => !!runner.resume(getActionType(actionOrType));

export function createActionQueueRunner(
  initialQueueProps: InitialQueue,
  logger: Logger = () => undefined
): RunnerFunctions {
  let pendingPromise: ActionExecutorPromise | undefined = undefined;
  let isDisposed = false;
  const queueController = createQueueController(
    createQueueFromProps(initialQueueProps)
  );

  // returns status of an action and what can be done with given action
  const getActionStatus: RunnerFunctions['getActionStatus'] = typeOrAction => {
    const action = queueController.getByType(getActionType(typeOrAction));
    if (!action || !action.type) {
      return 'invalid';
    }
    if (action.complete) {
      return 'complete';
    }
    const active = queueController.getActive();
    if (active) {
      if (active.type === action.type) {
        return pendingPromise ? 'pending' : 'active';
      } else {
        return 'in-queue';
      }
    }
    const next = queueController.getNext();
    if (next) {
      return next.type === action.type ? 'next' : 'not-next';
    }

    return 'unknown';
  };

  // calls the action.executor, stores and handles the returned promise.
  // executes also next action in queue when current is successfully executed.
  // logs all executions and successes/failures
  const execute = (action: Action): ActionExecutorPromise => {
    // action is copied, because the object is invalidated when updated. Copy remains unmutated.
    const promise = action.executor({ ...action }, queueController);
    pendingPromise = promise;

    const type = String(action.type);
    // log is called with the action, this gets the latest version from queue
    const getCurrentActionVersion = () =>
      queueController.getByType(type) as Action;

    queueController.activateAction(type);
    logger('started', getCurrentActionVersion(), queueController);
    const completeImmediately = getOption(action, 'syncronousCompletion');
    if (completeImmediately) {
      queueController.completeAction(type, undefined);
      logger('completed', getCurrentActionVersion(), queueController);
    }

    const completeAction = (
      propsForCompleteAction: Pick<ActionUpdateProps, 'errorMessage' | 'result'>
    ) => {
      pendingPromise = undefined;
      if (completeImmediately) {
        return;
      }
      const logType: LogType = propsForCompleteAction.errorMessage
        ? 'error'
        : 'completed';
      if (logType === 'completed') {
        queueController.completeAction(type, propsForCompleteAction.result);
      } else {
        queueController.setActionFailed(
          type,
          propsForCompleteAction.errorMessage
        );
      }
      logger(logType, getCurrentActionVersion(), queueController);
    };

    promise
      .then(value => {
        // promise can end after disposal
        if (isDisposed) {
          return;
        }
        completeAction({ result: value });

        const next = queueController.getNext();
        if (next) {
          execute(next);
        }
      })
      .catch(e => {
        if (isDisposed) {
          return;
        }
        completeAction({
          errorMessage:
            e instanceof Error
              ? e.message
              : `An error was returned: ${e ? e.toString() : ''}`,
        });
      });
    return promise;
  };

  // returns an error why an action cannot be executed
  // or undefined if it can be executed
  const getActionExectionError = (
    actionStatus: ActionStatus
  ): GenericErrorType | undefined => {
    if (actionStatus === 'pending' || actionStatus === 'next') {
      return undefined;
    }
    if (actionStatus === 'active') {
      return genericErrorTypes.CANNOT_EXECUTE_ACTION_IS_ACTIVE;
    }
    if (actionStatus === 'complete') {
      return genericErrorTypes.CANNOT_EXECUTE_ACTION_IS_COMPLETE;
    }
    if (actionStatus === 'in-queue') {
      return genericErrorTypes.CANNOT_EXECUTE_ANOTHER_ACTION_IS_ACTIVE;
    }
    if (actionStatus === 'not-next') {
      return genericErrorTypes.CANNOT_EXECUTE_ACTION_IS_NOT_NEXT;
    }

    return genericErrorTypes.CANNOT_EXECUTE_ACTION_IS_INVALID;
  };

  const resume = (startFrom: ActionType) => {
    const action = queueController.getByType(startFrom);
    if (!action) {
      return logger(
        genericErrorTypes.UNKNOWN_ACTION_TYPE,
        undefined,
        queueController
      );
    }
    const actionstatus = getActionStatus(action);
    const exectionError = getActionExectionError(actionstatus);
    if (!exectionError) {
      if (actionstatus !== 'pending') {
        execute(action);
      }
      return action;
    }
    return logger(exectionError, action, queueController);
  };

  const start = () => {
    // start() is always from first action. Resume is used for starting from another.
    const first = queueController.getQueue()[0];
    return resume(first.type);
  };

  const reset = () => {
    queueController.reset();
    logger('reset', undefined, queueController);
  };

  const dispose = () => {
    if (isDisposed) {
      return;
    }
    pendingPromise = undefined;
    isDisposed = true;
    queueController.clean();
  };

  return {
    ...queueController,
    reset,
    start,
    resume,
    dispose,
    getPromise: () => pendingPromise,
    getActionStatus,
  };
}
