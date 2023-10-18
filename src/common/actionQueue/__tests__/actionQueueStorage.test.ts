import { Action, ActionQueue, createQueueFromProps } from '../actionQueue';
import { storeQueue, getStoredQueue, StoredQueue } from '../actionQueueStorage';
import { getSuccessfulQueueProps } from '../test.util';

describe('actionQueueStorage', () => {
  const storageKey = 'test-key';
  const manuallySetSessionStorage = (data: string) =>
    sessionStorage.setItem(storageKey, data);
  const getStoredVersion = (action: Action) =>
    Object.entries(action).reduce((obj, [key, value]) => {
      const droppedProps = ['executor', 'options'];
      if (droppedProps.includes(key) || typeof value === 'undefined') {
        return obj;
      }
      Reflect.set(obj, key, value);
      return obj;
    }, {} as Partial<Action>);
  afterEach(() => {
    sessionStorage.removeItem(storageKey);
  });
  const defaultAction: Action = {
    type: 'action',
    executor: () => Promise.reject(new Error('Base action')),
    complete: false,
    active: false,
    updatedAt: 1,
    result: 'result',
    errorMessage: 'error',
    options: {
      idleWhenActive: true,
      syncronousCompletion: false,
      data: {
        item: 'some data',
      },
    },
  };
  describe('getStoredQueue() returns stored data as a parsed object. ', () => {
    it('If result is an object, it is returned as an object', () => {
      const complexResult = { a: 'a', b: { c: 'c' } };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { executor, errorMessage, ...storedData } = {
        ...defaultAction,
        result: { a: 'a', b: { c: 'c' } },
      };
      const data = JSON.stringify([storedData]);
      manuallySetSessionStorage(data);
      const fetchedData = getStoredQueue(storageKey);
      expect(fetchedData).toMatchObject([{ ...storedData }]);
      expect((fetchedData as ActionQueue)[0].result).toMatchObject(
        complexResult
      );
    });
    it('Returns undefined, if stored value is invalid JSON object', () => {
      manuallySetSessionStorage('fooo');
      expect(getStoredQueue(storageKey)).toBeUndefined();
      manuallySetSessionStorage('{a/');
      expect(getStoredQueue(storageKey)).toBeUndefined();
    });
  });
  describe('storeQueue() converts queue to a string and stores it', () => {
    it('Undefined values are not stored.', () => {
      const actionWithUndefinedProps = {
        ...defaultAction,
        errorMessage: undefined,
      };
      storeQueue(storageKey, [actionWithUndefinedProps]);
      expect(getStoredQueue(storageKey)).toMatchObject([
        getStoredVersion(actionWithUndefinedProps),
      ]);
    });
    it('Returns true when save was successful', () => {
      const actionsWithOptions = getSuccessfulQueueProps().map(action => ({
        ...action,
        options: {
          idleWhenActive: true,
          noStorage: true,
          data: {
            type: action.type,
          },
        },
      }));
      const queue = createQueueFromProps(actionsWithOptions);
      expect(storeQueue(storageKey, queue)).toBeTruthy();
      const restoredQueue = getStoredQueue(storageKey) as StoredQueue;
      expect(restoredQueue).toMatchObject(
        queue.map(action => getStoredVersion(action))
      );
      const action0 = restoredQueue[0] as Action;
      expect(action0.options).toBeUndefined();
      expect(action0.executor).toBeUndefined();
    });
    it('Returns false when save failed', () => {
      const queue = [
        ({
          ...defaultAction,
          result: {
            toJSON: () => {
              throw new Error('UPS');
            },
          },
        } as unknown) as Action,
      ];
      expect(storeQueue(storageKey, queue)).toBeFalsy();
    });
    it('Will not save action.result if action.options.noStorage is true', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const action = {
        ...defaultAction,
        result: 'not stored',
      };
      expect(storeQueue(storageKey, [action])).toBeTruthy();
      expect((getStoredQueue(storageKey) as ActionQueue)[0].result).toBe(
        action.result
      );
      expect(
        storeQueue(storageKey, [{ ...action, options: { noStorage: true } }])
      ).toBeTruthy();
      expect(
        (getStoredQueue(storageKey) as ActionQueue)[0].result
      ).toBeUndefined();
    });
  });
});
