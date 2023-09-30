import { ActionQueue, getOption } from './actionQueue';

export function getStoredQueue(storageKey: string): ActionQueue | undefined {
  const queue = sessionStorage.getItem(storageKey);
  try {
    return queue ? JSON.parse(queue) : undefined;
  } catch (e) {
    return undefined;
  }
}

function createStorageVersion(queue: ActionQueue) {
  return JSON.stringify(
    queue.map(action => {
      // "executor" is picked just to exclude it from "rest"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { result, executor, ...rest } = action;

      const storageResult =
        getOption(action, 'noStorage') === true ? undefined : result;
      return {
        ...rest,
        result: storageResult,
      };
    })
  );
}

export function storeQueue(storageKey: string, queue: ActionQueue | null) {
  try {
    if (!queue) {
      sessionStorage.removeItem(storageKey);
    } else {
      sessionStorage.setItem(storageKey, createStorageVersion(queue));
    }
    return true;
  } catch (e) {
    return false;
  }
}
