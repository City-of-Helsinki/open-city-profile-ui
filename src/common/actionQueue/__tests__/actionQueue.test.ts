import {
  ActionProps,
  Action,
  createQueueController,
  createQueueFromProps,
  ActionQueue,
  ActionUpdateProps,
} from '../actionQueue';

type ActionSourceForTesting = Pick<ActionProps, 'type'> & {
  resolveValue?: Action['result'];
  rejectValue?: string | Error;
  executionDelay?: number;
};

describe('actionQueue', () => {
  const defaultExecutionDelay = 20;
  const convertSourceToActionProps = ({
    type,
    rejectValue,
    resolveValue,
    executionDelay = defaultExecutionDelay,
  }: ActionSourceForTesting): ActionProps => ({
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
  });

  const resolvingAction1: ActionSourceForTesting = {
    type: 'resolving1',
    resolveValue: 1,
  };

  const resolvingAction2: ActionSourceForTesting = {
    type: 'resolving2',
    resolveValue: 1,
  };

  const readyMadeActionSource: ActionSourceForTesting = {
    type: 'readyMadeAction',
    resolveValue: 'readt',
  };

  const readyMadeAction: Action = {
    ...{ ...convertSourceToActionProps(readyMadeActionSource) },
    complete: false,
    active: false,
    updatedAt: 1,
    result: undefined,
    errorMessage: undefined,
  };

  const verifyAction = (action: Partial<Action>): boolean =>
    typeof action.complete === 'boolean' &&
    typeof action.active === 'boolean' &&
    typeof action.executor === 'function' &&
    typeof action.errorMessage === 'undefined' &&
    typeof action.updatedAt === 'number' &&
    typeof action.type === 'string' &&
    typeof action.result === 'undefined';

  const cloneArray = (array: ActionQueue) => array.map(item => ({ ...item }));

  describe('createQueueFromProps', () => {
    it('Converts plain props to an Action', () => {
      const queue = createQueueFromProps([
        convertSourceToActionProps(resolvingAction1),
        convertSourceToActionProps(resolvingAction2),
        readyMadeAction,
      ]);
      expect(verifyAction(queue[0])).toBeTruthy();
      expect(verifyAction(queue[1])).toBeTruthy();
      expect(verifyAction(queue[2])).toBeTruthy();
    });
    it('Passed objects that are valid actions, are not mutated', () => {
      const props = convertSourceToActionProps(resolvingAction1);
      const queue = createQueueFromProps([readyMadeAction, props]);
      expect(queue[0]).toEqual(readyMadeAction);
      expect(queue[1]).not.toEqual(props);
    });
    it('Throws when passing actions without a type', () => {
      expect(() =>
        createQueueFromProps([{ ...readyMadeAction, type: '' }])
      ).toThrow();
    });
    it('Throws when passing actions with same types', () => {
      expect(() =>
        createQueueFromProps([readyMadeAction, readyMadeAction])
      ).toThrow();
    });
  });
  describe('createQueueController', () => {
    const basicQueue = createQueueFromProps([
      convertSourceToActionProps(resolvingAction1),
      convertSourceToActionProps(resolvingAction2),
      { ...readyMadeAction },
    ]);
    describe('calling the function', () => {
      it('Throws when passing actions without a type', () => {
        expect(() =>
          createQueueController(
            cloneArray([...basicQueue, { ...readyMadeAction, type: '' }])
          )
        ).toThrow();
      });
      it('Throws when passing actions with same types', () => {
        expect(() =>
          createQueueController(
            cloneArray([...basicQueue, { ...readyMadeAction }])
          )
        ).toThrow();
      });
    });
    describe('getQueue()', () => {
      it('Returns only a copy of actions. Queue cannot be mutated externally and stored actions are preserved.', () => {
        const controller = createQueueController(cloneArray(basicQueue));
        const copiedQueue = controller.getQueue();
        copiedQueue.forEach(action => {
          expect(verifyAction(action)).toBeTruthy();
          action.result = 'foo';
        });
        controller.getQueue().forEach(action => {
          expect(action.result).toBeUndefined();
        });
      });
    });
    describe('clean()', () => {
      it('Invalidates all actions and removes them from queue', () => {
        const safeArray = cloneArray(basicQueue);
        const controller = createQueueController(safeArray);
        const copyOfReadyMadeAction = safeArray.at(-1) as Action;
        const oldQueue = controller.getQueue();
        controller.clean();
        const clearedQueue = controller.getQueue();
        expect(oldQueue.length).toBe(basicQueue.length);
        expect(clearedQueue.length).toBe(0);
        expect(verifyAction(copyOfReadyMadeAction)).toBeFalsy();
        expect(copyOfReadyMadeAction.executor).toThrow();
        expect(copyOfReadyMadeAction.type).toBe('');
      });
    });
    describe('reset()', () => {
      it('Copies old actions and resets updatable props. Old actions are invalidated.', () => {
        const finishedAction: Action = {
          ...readyMadeAction,
          type: 'copyOfReadyMadeAction',
          complete: true,
          active: true,
          updatedAt: 1,
          result: 100,
          errorMessage: 'Error',
        };
        const testQueue = [...cloneArray(basicQueue), { ...finishedAction }];

        const copyOfFinishedAction = testQueue.at(-1) as Action;
        const controller = createQueueController(testQueue);
        const oldQueue = controller.getQueue();
        controller.reset();
        const resetQueue = controller.getQueue();
        const resetFinishedAction = resetQueue.at(-1) as Action;
        expect(resetQueue.length).toBe(oldQueue.length);

        // values are reset
        expect(resetFinishedAction.type).toBe(finishedAction.type);
        expect(resetFinishedAction.executor).toBe(finishedAction.executor);
        expect(resetFinishedAction.updatedAt).not.toBe(
          finishedAction.updatedAt
        );
        expect(resetFinishedAction.complete).toBeFalsy();
        expect(resetFinishedAction.active).toBeFalsy();
        expect(resetFinishedAction.result).toBeUndefined();
        expect(resetFinishedAction.errorMessage).toBeUndefined();

        // old actions are invalidated
        expect(verifyAction(copyOfFinishedAction)).toBeFalsy();
        expect(copyOfFinishedAction.executor).toThrow();
        expect(copyOfFinishedAction.type).toBe('');
      });
    });
    describe('updateActionAndQueue()', () => {
      it(`Updates an action by type. 
          "updatedAt" will be set to Date.now(). 
          The old queue is copied as new.
          Old queue is invalidated.`, () => {
        const testQueue = cloneArray(basicQueue);

        const originalReadyMadeAction = testQueue.at(-1) as Action;
        const copyOfReadyMadeActionProps = { ...originalReadyMadeAction };
        const controller = createQueueController(testQueue);
        const oldQueue = controller.getQueue();
        const updatedProps: ActionUpdateProps = {
          result: 'testResult',
          errorMessage: 'error',
          complete: true,
          active: true,
          updatedAt: -10,
        };
        controller.updateActionAndQueue(readyMadeAction.type, updatedProps);
        const updatedQueue = controller.getQueue();
        const updatedFinishedAction = updatedQueue.at(-1) as Action;
        expect(updatedFinishedAction).toMatchObject({
          ...copyOfReadyMadeActionProps,
          ...updatedProps,
          updatedAt: updatedFinishedAction.updatedAt,
        });
        // other actions are not modified
        expect(oldQueue.length).toBe(updatedQueue.length);
        oldQueue.forEach((oldAction, index) => {
          if (oldAction.type === copyOfReadyMadeActionProps.type) {
            return;
          }
          const newAction = updatedQueue[index];
          expect(oldAction).toMatchObject(newAction);
        });
        // old actions are invalidated
        expect(verifyAction(originalReadyMadeAction)).toBeFalsy();
        expect(originalReadyMadeAction.executor).toThrow();
        expect(originalReadyMadeAction.type).toBe('');
      });
    });
  });
});
