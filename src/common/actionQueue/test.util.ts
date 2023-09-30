import {
  ActionProps,
  Action,
  ActionQueue,
  createQueueFromProps,
  ActionExecutor,
  JSONStringifyableResult,
  InitialQueue,
} from './actionQueue';

export type ActionSourceForTesting = Pick<ActionProps, 'type'> & {
  resolveValue?: Action['result'];
  rejectValue?: string | Error;
  executionDelay?: number;
};

const defaultExecutionDelay = 20;
export function convertSourceToActionProps({
  type,
  rejectValue,
  resolveValue,
  executionDelay = defaultExecutionDelay,
}: ActionSourceForTesting): ActionProps {
  return {
    type,
    executor: () => {
      if (resolveValue) {
        return new Promise(resolve =>
          setTimeout(() => resolve(resolveValue), executionDelay)
        );
      }
      return new Promise((resolve, reject) =>
        setTimeout(() => reject(rejectValue), executionDelay)
      );
    },
  };
}

export const resolvingAction1: ActionSourceForTesting = {
  type: 'resolving1',
  resolveValue: 1,
};

export const resolvingAction2: ActionSourceForTesting = {
  type: 'resolving2',
  resolveValue: 2,
};

export const rejectingAction: ActionSourceForTesting = {
  type: 'rejecting1',
  rejectValue: new Error('Rejected'),
};

export const readyMadeActionSource: ActionSourceForTesting = {
  type: 'readyMadeAction',
  resolveValue: 'ready',
};

export const baseAction: Action = {
  type: '',
  executor: () => Promise.reject(new Error('Base action')),
  complete: false,
  active: false,
  updatedAt: 1,
  result: undefined,
  errorMessage: undefined,
};

export const readyMadeAction: Action = {
  ...baseAction,
  ...{ ...convertSourceToActionProps(readyMadeActionSource) },
};

export function getSuccessfulQueueProps(): InitialQueue {
  return [
    convertSourceToActionProps(resolvingAction1),
    convertSourceToActionProps(resolvingAction2),
  ];
}

export function verifyAction(action: Partial<Action>): boolean {
  return (
    typeof action.complete === 'boolean' &&
    typeof action.active === 'boolean' &&
    typeof action.executor === 'function' &&
    typeof action.errorMessage === 'undefined' &&
    typeof action.updatedAt === 'number' &&
    typeof action.type === 'string' &&
    typeof action.result === 'undefined'
  );
}

export function cloneArray(array: ActionQueue) {
  return array.map(item => ({ ...item }));
}

export function createQueueWithCommonActions(
  additionalActions: Array<ActionProps | Action> = []
) {
  return createQueueFromProps([
    ...[
      convertSourceToActionProps(resolvingAction1),
      convertSourceToActionProps(resolvingAction2),
      { ...readyMadeAction },
    ],
    ...additionalActions,
  ]);
}

export function createManuallyTriggerableExecutor({
  resolveValue,
  rejectValue,
}: ActionSourceForTesting) {
  const voidFunction: () => void | undefined = () => undefined;
  let trigger = voidFunction;
  const reset = () => {
    trigger = voidFunction;
  };
  const promise = new Promise<JSONStringifyableResult>((resolve, reject) => {
    if (resolveValue) {
      trigger = () => {
        resolve(resolveValue);
        reset();
      };
    } else {
      trigger = () => {
        reject(rejectValue);
        reset();
      };
    }
  });
  const executor: ActionExecutor = async () => promise;
  return { trigger, executor };
}
