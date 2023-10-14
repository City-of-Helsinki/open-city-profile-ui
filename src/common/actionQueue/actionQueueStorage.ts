import { AnyObject } from '../../graphql/typings';
import {
  Action,
  ActionQueue,
  ActionUpdateProps,
  getData,
  getOption,
} from './actionQueue';

type ActionStorageProps = ActionUpdateProps & Pick<Action, 'type' | 'options'>;
export type StoredQueue = ActionStorageProps[];
export function getStoredQueue(storageKey: string): StoredQueue | undefined {
  const queue = sessionStorage.getItem(storageKey);
  try {
    return queue ? JSON.parse(queue) : undefined;
  } catch (e) {
    return undefined;
  }
}

function createStorageVersion(queue: ActionQueue): StoredQueue {
  return queue.map(action => {
    // "executor" is picked just to exclude it from "rest"
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { result, executor, ...rest } = action;

    const storageResult =
      getOption(action, 'noStorage') === true ? undefined : result;
    return {
      ...rest,
      result: storageResult,
    };
  });
}

function createStorageValue(queue: ActionQueue) {
  return JSON.stringify(createStorageVersion(queue));
}

export function storeQueue(storageKey: string, queue: ActionQueue | null) {
  try {
    if (!queue) {
      sessionStorage.removeItem(storageKey);
    } else {
      sessionStorage.setItem(storageKey, createStorageValue(queue));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoredQueueData(storageKey: string) {
  const storedQueue = getStoredQueue(storageKey);
  return storedQueue
    ? storedQueue.reduce((data, action) => {
        const actionData = getData(action as Action);
        return actionData && typeof actionData === 'object'
          ? {
              ...data,
              ...actionData,
            }
          : data;
      }, {} as AnyObject)
    : undefined;
}
