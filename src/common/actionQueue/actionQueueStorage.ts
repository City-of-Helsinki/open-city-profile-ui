import { AnyObject } from '../../graphql/typings';
import { Action, ActionQueue, ActionUpdateProps, getData, getOption } from './actionQueue';

type ActionStorageProps = ActionUpdateProps & Pick<Action, 'type' | 'data'>;
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
  return queue.map((action): ActionStorageProps => {
    const { result, updatedAt, complete, errorMessage, type, active, data } = action;

    const storageResult = getOption(action, 'noStorage') === true ? undefined : result;
    return {
      updatedAt,
      complete,
      errorMessage,
      type,
      active,
      result: storageResult,
      data,
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
  return (
    storedQueue &&
    storedQueue.reduce((data, action) => {
      const actionData = getData(action as Action);
      return actionData && typeof actionData === 'object'
        ? {
            ...data,
            ...actionData,
          }
        : data;
    }, {} as AnyObject)
  );
}
