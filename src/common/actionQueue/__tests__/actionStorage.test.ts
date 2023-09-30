import { Action, ActionQueue, createQueueFromProps } from '../actionQueue';
import { storeQueue, getStoredQueue } from '../actionQueueStorage';
import { baseAction, getSuccessfulQueueProps } from '../test.util';

describe('actionStorage', () => {
  const storageKey = 'test-key';
  const setStoredData = (data: string) =>
    sessionStorage.setItem(storageKey, data);
  const getStoredVersion = (action: Action) =>
    Object.entries(action).reduce((obj, [key, value]) => {
      if (key === 'executor' || typeof value === 'undefined') {
        return obj;
      }
      Reflect.set(obj, key, value);
      return obj;
    }, {} as Partial<Action>);
  afterEach(() => {
    sessionStorage.removeItem(storageKey);
  });
  describe('getStoredQueue() returns stored data as a parsed object. ', () => {
    it('Undefined values are not stored.', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { executor, result, errorMessage, ...storedData } = baseAction;
      const data = JSON.stringify([storedData]);
      setStoredData(data);
      expect(getStoredQueue(storageKey)).toMatchObject([{ ...storedData }]);
    });
    it('If result is an object, it is returned as an object', () => {
      const complexResult = { a: 'a', b: { c: 'c' } };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { executor, errorMessage, ...storedData } = {
        ...baseAction,
        result: { a: 'a', b: { c: 'c' } },
      };
      const data = JSON.stringify([storedData]);
      setStoredData(data);
      const fetchedData = getStoredQueue(storageKey);
      expect(fetchedData).toMatchObject([{ ...storedData }]);
      expect((fetchedData as ActionQueue)[0].result).toMatchObject(
        complexResult
      );
    });
    it('Returns undefined, if stored value is invalid JSON object', () => {
      setStoredData('fooo');
      expect(getStoredQueue(storageKey)).toBeUndefined();
      setStoredData('{a/');
      expect(getStoredQueue(storageKey)).toBeUndefined();
    });
  });
  describe('storeQueue() converts queue to a string and stores it', () => {
    it('Returns true when save was successful', () => {
      const queue = createQueueFromProps(getSuccessfulQueueProps());
      expect(storeQueue(storageKey, queue)).toBeTruthy();
      expect(getStoredQueue(storageKey)).toMatchObject(
        queue.map(action => getStoredVersion(action))
      );
    });
    it('Returns false when save failed', () => {
      const queue = [
        {
          ...baseAction,
          toJSON: () => {
            throw new Error('UPS');
          },
        },
      ];
      expect(storeQueue(storageKey, queue)).toBeFalsy();
    });
    it('Will not save action.result if action.options.noStorage is true', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const action = {
        ...baseAction,
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
