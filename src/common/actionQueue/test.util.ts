import {
  ActionProps,
  Action,
  ActionQueue,
  createQueueFromProps,
} from './actionQueue';

export type ActionSourceForTesting = Pick<ActionProps, 'type'> & {
  resolveValue?: Action['result'];
  rejectValue?: string | Error;
  executionDelay?: number;
};

export function convertSourceToActionProps({
  type,
  rejectValue,
  resolveValue,
}: ActionSourceForTesting): ActionProps {
  return {
    type,
    executor: () =>
      resolveValue
        ? Promise.resolve(resolveValue)
        : Promise.reject(rejectValue),
  };
}

export const resolvingActionSource1: ActionSourceForTesting = {
  type: 'resolving1',
  resolveValue: 1,
};

export const resolvingActionSource2: ActionSourceForTesting = {
  type: 'resolving2',
  resolveValue: 2,
};

export const rejectingActionSource: ActionSourceForTesting = {
  type: 'rejecting1',
  rejectValue: new Error('Rejected'),
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

export const resolvingAction: Action = {
  ...baseAction,
  ...{
    ...convertSourceToActionProps({
      type: 'readyMadeAction',
      resolveValue: 'ready',
    }),
  },
};

export function verifyAction(action: Partial<Action>): boolean {
  // Max number of allowed conditional operators is 3 in SonarCloud so splitted these
  const booleansAreSet =
    typeof action.complete === 'boolean' && typeof action.active === 'boolean';

  const resultsAreUndefined =
    typeof action.errorMessage === 'undefined' &&
    typeof action.result === 'undefined';

  const basePropsAreSet =
    typeof action.executor === 'function' &&
    typeof action.updatedAt === 'number' &&
    typeof action.type === 'string';

  return booleansAreSet && resultsAreUndefined && basePropsAreSet;
}

export function cloneArray(array: ActionQueue) {
  return array.map(item => ({ ...item }));
}

export function createQueueWithCommonActions(
  additionalActions: Array<ActionProps | Action> = []
) {
  return createQueueFromProps([
    ...[
      convertSourceToActionProps(resolvingActionSource1),
      convertSourceToActionProps(resolvingActionSource2),
      { ...resolvingAction },
    ],
    ...additionalActions,
  ]);
}
