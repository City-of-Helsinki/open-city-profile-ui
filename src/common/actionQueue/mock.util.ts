import {
  ActionExecutor,
  ActionProps,
  ActionType,
  createQueueFromProps,
} from './actionQueue';
import { ActionSourceForTesting } from './test.util';

export type ActionMockData = Pick<
  ActionSourceForTesting,
  'type' | 'resolveValue' | 'rejectValue'
> & {
  isTriggered?: boolean;
  isComplete?: boolean;
  runOriginal?: boolean;
  autoTrigger?: boolean;
};

const mockActionData: Map<string, ActionMockData> = new Map();
const mockedExecutorTriggers: Map<string, () => void> = new Map();
const mockedExecutors: Map<string, ActionExecutor> = new Map();
const originalExecutors: Map<string, ActionExecutor> = new Map();

export function cleanMockData() {
  mockActionData.clear();
  mockedExecutorTriggers.clear();
  mockedExecutors.clear();
}

const trackTriggering = (actionType: ActionType) => {
  const data = mockActionData.get(actionType) as ActionMockData;
  mockActionData.set(actionType, { ...data, isTriggered: true });
};

const trackCompletion = (actionType: ActionType) => {
  const data = mockActionData.get(actionType) as ActionMockData;
  mockActionData.set(actionType, { ...data, isComplete: true });
};

export const isActionTriggered = (actionType: ActionType) => {
  const data = mockActionData.get(actionType) as ActionMockData;
  return data.isTriggered;
};

export const isActionCompleted = (actionType: ActionType) => {
  const data = mockActionData.get(actionType) as ActionMockData;
  return data.isComplete;
};

export const completeActionExecutor = (type: ActionType) => {
  const trigger = mockedExecutorTriggers.get(type);
  if (!trigger) {
    throw new Error(`Unknown type ${type}`);
  }
  trigger();
};

const createManualExecutor = (): ActionExecutor => action =>
  new Promise((resolve, reject) => {
    const type = action.type;
    const trigger = () => {
      const data = mockActionData.get(type);
      if (!data) {
        reject(new Error('NO return value'));
      } else if (data.resolveValue) {
        resolve(data.resolveValue);
      } else {
        reject(data?.rejectValue);
      }
      trackCompletion(type);
    };
    mockedExecutorTriggers.set(type, trigger);
  });

export const runOrCreateExecutor: ActionExecutor = async (
  action,
  controller
) => {
  const { type } = action;
  const data = mockActionData.get(type);
  if (data && data.runOriginal) {
    const original = originalExecutors.get(type) as ActionExecutor;
    trackTriggering(type);
    return original(action, controller).finally(() => trackCompletion(type));
  }
  if (data && data.autoTrigger) {
    setTimeout(() => {
      completeActionExecutor(type);
    }, 20);
  }
  trackTriggering(type);
  const currentExecutor = mockedExecutors.get(type);
  if (currentExecutor) {
    return currentExecutor(action, controller);
  }
  const newExecutor = createManualExecutor();
  mockedExecutors.set(type, newExecutor);
  return newExecutor(action, controller);
};

export const storeOriginalExecutor = (action: ActionProps) => {
  originalExecutors.set(action.type, action.executor);
};

export const setMockActionData = (data: ActionMockData) => {
  mockActionData.set(data.type, {
    ...data,
    isTriggered: false,
    isComplete: false,
  });
};

export const createTriggerableExecutor = (actionProps: ActionProps) => {
  storeOriginalExecutor(actionProps);
  return {
    ...actionProps,
    executor: (...args: Parameters<ActionExecutor>) =>
      runOrCreateExecutor(...args),
  };
};

export const createActionWithTriggerableExecutor = (source: ActionMockData) => {
  const { type } = source;
  setMockActionData(source);
  const action = createQueueFromProps([
    { type, executor: () => Promise.resolve(true) },
  ])[0];
  storeOriginalExecutor(action);
  return createTriggerableExecutor(action);
};
