import {
  Action,
  createQueueController,
  createQueueFromProps,
  ActionUpdateProps,
  QueueController,
  ActionQueue,
  getOption,
  getData,
  hasMatchingDataProperty,
} from '../actionQueue';
import {
  convertSourceToActionProps,
  verifyAction,
  createQueueWithCommonActions,
  cloneArray,
  resolvingAction1,
  resolvingAction2,
  readyMadeAction,
} from '../test.util';

describe('actionQueue', () => {
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
            createQueueWithCommonActions([{ ...readyMadeAction, type: '' }])
          )
        ).toThrow();
      });
      it('Throws when passing actions with same types', () => {
        expect(() =>
          createQueueController(
            cloneArray(createQueueWithCommonActions([{ ...readyMadeAction }]))
          )
        ).toThrow();
      });
    });
    describe('getQueue()', () => {
      it('Returns only a copy of actions. Queue cannot be mutated externally and stored actions are preserved.', () => {
        const controller = createQueueController(
          createQueueWithCommonActions()
        );
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
        const safeArray = createQueueWithCommonActions();
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
        const testQueue = createQueueWithCommonActions([{ ...finishedAction }]);

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
        const testQueue = createQueueWithCommonActions();

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
    describe('getByType()', () => {
      it('Returns one matching action or undefined', () => {
        const testQueue = createQueueWithCommonActions();
        const controller = createQueueController(testQueue);
        testQueue.forEach(action => {
          expect(action).toMatchObject(
            controller.getByType(action.type) as Action
          );
        });
        expect(controller.getByType('')).toBeUndefined();
        expect(controller.getByType('abc')).toBeUndefined();
      });
    });
    describe('getResult()', () => {
      it('Returns result of an action by type. Action must have complete:true', () => {
        const testQueue = createQueueWithCommonActions([
          {
            ...readyMadeAction,
            type: 'result1',
            result: 'result1',
            complete: true,
          },
          {
            ...readyMadeAction,
            type: 'result2',
            result: { value: 'result2' },
            complete: true,
          },
          {
            ...readyMadeAction,
            type: 'result3',
            result: 'result',
          },
        ]);
        const controller = createQueueController(testQueue);
        expect(controller.getResult('result1')).toBe('result1');
        expect(controller.getResult('result2')).toMatchObject({
          value: 'result2',
        });
        expect(controller.getResult('result3')).toBe(undefined);
      });
    });
    describe('getNext()', () => {
      it(`Returns the first action which is not completed and not active. 
          If action.options.idleWhenActive is true, then active action is returned.`, () => {
        const testQueue = createQueueFromProps([
          {
            ...readyMadeAction,
            type: 'complete1',
            complete: true,
            active: false,
          },
          {
            ...readyMadeAction,
            type: 'complete2',
            complete: true,
            active: false,
          },
          {
            ...readyMadeAction,
            type: 'active',
            complete: false,
            active: true,
          },
          {
            ...readyMadeAction,
            type: 'idleWhenActive',
            complete: false,
            active: true,
            options: {
              idleWhenActive: true,
            },
          },
        ]);
        const controller = createQueueController(testQueue);
        expect(controller.getNext()).toMatchObject(testQueue[3]);
        // change #2 to fulfill getNext()-filter requirements
        controller.updateActionAndQueue('active', { active: false });
        expect((controller.getNext() as Action).type).toBe('active');
        // change #1 to fulfill getNext()-filter requirements
        controller.updateActionAndQueue('complete2', { complete: false });
        expect((controller.getNext() as Action).type).toBe('complete2');
        // change #0 to fulfill getNext()-filter requirements
        controller.updateActionAndQueue('complete1', { complete: false });
        expect((controller.getNext() as Action).type).toBe('complete1');
      });
      it(`Returns undefined when there are no idle actions`, () => {
        const testQueue = createQueueFromProps([
          {
            ...readyMadeAction,
            type: 'complete1',
            complete: true,
            active: false,
          },
          {
            ...readyMadeAction,
            type: 'complete2',
            complete: true,
            active: false,
          },
        ]);
        const controller = createQueueController(testQueue);
        expect(controller.getNext()).toBeUndefined();
      });
    });
    describe('getActive()', () => {
      it(`Returns the first action where active is true. Or undefined when no action is found.`, () => {
        const testQueue = createQueueFromProps([
          {
            ...readyMadeAction,
            type: 'completeAndActive',
            complete: true,
            active: true,
          },
          {
            ...readyMadeAction,
            type: 'active',
            complete: false,
            active: true,
          },
          {
            ...readyMadeAction,
            type: 'idleWhenActive',
            complete: false,
            active: true,
            options: {
              idleWhenActive: true,
            },
          },
        ]);
        const controller = createQueueController(testQueue);
        expect((controller.getActive() as Action).type).toBe(
          'completeAndActive'
        );

        controller.updateActionAndQueue('completeAndActive', { active: false });
        expect((controller.getActive() as Action).type).toBe('active');

        controller.updateActionAndQueue('active', { active: false });
        expect((controller.getActive() as Action).type).toBe('idleWhenActive');

        controller.updateActionAndQueue('idleWhenActive', { active: false });
        expect(controller.getActive() as Action).toBeUndefined();
      });
    });
    describe('getFailed()', () => {
      it(`Returns the first action which has an errorMessage and is complete.`, () => {
        const testQueue = createQueueFromProps([
          {
            ...readyMadeAction,
            type: 'error1',
            errorMessage: 'error',
            complete: false,
          },
          {
            ...readyMadeAction,
            type: 'noError',
            complete: true,
            active: true,
            result: 'result',
          },
          {
            ...readyMadeAction,
            type: 'errorAndResult',
            errorMessage: 'error',
            complete: true,
          },
        ]);
        const controller = createQueueController(testQueue);
        expect((controller.getFailed() as Action).type).toBe('errorAndResult');

        controller.updateActionAndQueue('errorAndResult', {
          errorMessage: undefined,
        });
        controller.updateActionAndQueue('error1', {
          complete: true,
        });
        expect((controller.getFailed() as Action).type).toBe('error1');

        controller.updateActionAndQueue('error1', {
          errorMessage: undefined,
        });
        expect(controller.getFailed() as Action).toBeUndefined();
      });
    });
    describe('getComplete()', () => {
      it(`Returns all actions where complete is true.`, () => {
        const testQueue = createQueueFromProps([
          {
            ...readyMadeAction,
            type: 'completeAndActive',
            complete: true,
            active: true,
          },
          {
            ...readyMadeAction,
            type: 'active',
            complete: false,
            active: true,
          },
          {
            ...readyMadeAction,
            type: 'idleWhenActive',
            complete: true,
            active: true,
            options: {
              idleWhenActive: true,
            },
          },
        ]);
        const controller = createQueueController(testQueue);
        const getCompleteTypes = () =>
          controller.getComplete().map(action => action.type);
        expect(getCompleteTypes()).toMatchObject([
          'completeAndActive',
          'idleWhenActive',
        ]);

        controller.updateActionAndQueue('completeAndActive', {
          complete: false,
        });
        expect(getCompleteTypes()).toMatchObject(['idleWhenActive']);

        controller.updateActionAndQueue('idleWhenActive', {
          complete: false,
        });
        expect(getCompleteTypes()).toHaveLength(0);
      });
    });
    describe('isFinished()', () => {
      it(`Returns true if all actions are complete or if one has failed (and is completed).`, () => {
        const testQueue = createQueueFromProps([
          {
            ...readyMadeAction,
            type: 'complete1',
            complete: true,
            active: true,
          },
          {
            ...readyMadeAction,
            type: 'complete2',
            complete: true,
          },
          {
            ...readyMadeAction,
            type: 'complete3',
            complete: true,
            active: true,
            options: {
              idleWhenActive: true,
            },
          },
          {
            ...readyMadeAction,
            type: 'complete4',
            complete: true,
          },
        ]);
        const controller = createQueueController(testQueue);

        // if all are complete, whole queue is complete
        expect(controller.isFinished()).toBeTruthy();

        controller.updateActionAndQueue('complete4', {
          complete: undefined,
        });
        // if one has only errorMessage but is not complete, whole queue is not complete
        expect(controller.isFinished()).toBeFalsy();

        controller.reset();
        // if one has error, whole queue is complete
        controller.updateActionAndQueue('complete4', {
          complete: true,
          errorMessage: 'error',
        });
        expect(controller.isFinished()).toBeTruthy();

        // if one is complete, whole queue is not complete
        controller.updateActionAndQueue('complete4', {
          errorMessage: undefined,
        });
        expect(controller.isFinished()).toBeFalsy();
      });
    });
    describe('action updaters', () => {
      const createUpdateScenarioForTwoActions = (): [
        QueueController,
        Action,
        Action,
        Action
      ] => {
        const controller = createQueueController(
          createQueueWithCommonActions()
        );
        const queue = controller.getQueue();
        return [controller, { ...queue[0] }, { ...queue[1] }, { ...queue[2] }];
      };
      const checkUpdatedQueueProps = (
        action: Action,
        newQueue: ActionQueue,
        expectedProps: Partial<Action>
      ) => {
        expect(
          newQueue.find(queueAction => queueAction.type === action.type)
        ).toMatchObject(expectedProps);
      };

      describe('completeAction()', () => {
        it(`Sets action.complete to true and action.result to passed result. 
          Passed target can be action or action.type. 
          Returns an updated queue.`, () => {
          const [
            controller,
            targetAction1,
            targetAction2,
            targetAction3,
          ] = createUpdateScenarioForTwoActions();

          const setActionAsComplete = (action: Action) => {
            const result = `${action.type} result`;
            const newQueue = controller.completeAction(action, result);
            checkUpdatedQueueProps(action, newQueue, {
              complete: true,
              result,
            });
          };

          setActionAsComplete(targetAction1);
          setActionAsComplete(targetAction2);
          setActionAsComplete(targetAction3);
        });
        it(`Throws when action is already complete, errorneous or invalid`, () => {
          const [
            controller,
            targetAction1,
            targetAction2,
            targetAction3,
          ] = createUpdateScenarioForTwoActions();

          const attemptCompleteAction = (
            action: Action,
            presetPropsForError?: Partial<ActionUpdateProps>
          ) => {
            if (presetPropsForError) {
              controller.updateActionAndQueue(action.type, presetPropsForError);
            }
            expect(() =>
              controller.completeAction(action.type, 'result')
            ).toThrow();
          };

          attemptCompleteAction(targetAction1, {
            complete: true,
          });
          attemptCompleteAction(targetAction2, {
            complete: true,
            errorMessage: 'error',
          });
          controller.clean();
          attemptCompleteAction(targetAction3);
        });
      });
      describe('setActionFailed()', () => {
        it(`Sets action.complete to true and action.errorMessage to passed string. 
          Passed target can be action or action.type. 
          Returns an updated queue.`, () => {
          const [
            controller,
            targetAction1,
            targetAction2,
            targetAction3,
          ] = createUpdateScenarioForTwoActions();

          const setActionAsFailed = (action: Action) => {
            const errorMessage = `${action.type} failed`;
            const newQueue = controller.setActionFailed(action, errorMessage);
            checkUpdatedQueueProps(action, newQueue, {
              complete: true,
              errorMessage,
            });
          };

          setActionAsFailed(targetAction1);
          setActionAsFailed(targetAction2);
          setActionAsFailed(targetAction3);
        });
        it(`Throws when action is already complete, errorneous or invalid`, () => {
          const [
            controller,
            targetAction1,
            targetAction2,
            targetAction3,
          ] = createUpdateScenarioForTwoActions();

          const attemptCompleteAction = (
            action: Action,
            presetPropsForError?: Partial<ActionUpdateProps>
          ) => {
            if (presetPropsForError) {
              controller.updateActionAndQueue(action.type, presetPropsForError);
            }
            expect(() =>
              controller.setActionFailed(action.type, 'result')
            ).toThrow();
          };

          attemptCompleteAction(targetAction1, {
            complete: true,
          });
          attemptCompleteAction(targetAction2, {
            complete: true,
            errorMessage: 'error',
          });
          controller.clean();
          attemptCompleteAction(targetAction3);
        });
      });
      describe('activateAction()', () => {
        it(`Sets action.active to true. 
          Passed target can be action or action.type. 
          Returns an updated queue.`, () => {
          const [
            controller,
            targetAction1,
            targetAction2,
            targetAction3,
          ] = createUpdateScenarioForTwoActions();

          const setActionAsComplete = (action: Action) => {
            const newQueue = controller.activateAction(action);
            checkUpdatedQueueProps(action, newQueue, {
              active: true,
            });
          };

          setActionAsComplete(targetAction1);
          setActionAsComplete(targetAction2);
          setActionAsComplete(targetAction3);
        });
        it(`Throws when action is already active, finished or invalid`, () => {
          const [
            controller,
            targetAction1,
            targetAction2,
            targetAction3,
          ] = createUpdateScenarioForTwoActions();

          const attemptActivateAction = (
            action: Action,
            presetPropsForError?: Partial<ActionUpdateProps>
          ) => {
            if (presetPropsForError) {
              controller.updateActionAndQueue(action.type, presetPropsForError);
            }
            expect(() => controller.activateAction(action.type)).toThrow();
          };

          attemptActivateAction(targetAction1, {
            complete: true,
          });
          attemptActivateAction(targetAction2, {
            active: true,
          });
          controller.clean();
          attemptActivateAction(targetAction3);
        });
      });
    });
  });
  describe('Helpers', () => {
    it('getOption() returns any action option as boolean, if exists', () => {
      const actionWithAllOptions = {
        ...readyMadeAction,
        type: 'result1',
        options: {
          noStorage: true,
          syncronousCompletion: true,
          idleWhenActive: true,
          data: { name: 'result1' },
        },
      };
      const actionWithNoOptionsProp = {
        ...readyMadeAction,
        type: 'result2',
      };
      const actionWithoutOptions = {
        ...readyMadeAction,
        type: 'result3',
        options: {},
      };

      expect(getOption(actionWithAllOptions, 'data')).toBeTruthy();
      expect(getOption(actionWithAllOptions, 'noStorage')).toBeTruthy();
      expect(
        getOption(actionWithAllOptions, 'syncronousCompletion')
      ).toBeTruthy();
      expect(getOption(actionWithAllOptions, 'idleWhenActive')).toBeTruthy();

      expect(getOption(actionWithNoOptionsProp, 'data')).toBeFalsy();
      expect(getOption(actionWithNoOptionsProp, 'idleWhenActive')).toBeFalsy();
      expect(getOption(actionWithoutOptions, 'noStorage')).toBeFalsy();
      expect(
        getOption(actionWithoutOptions, 'syncronousCompletion')
      ).toBeFalsy();
    });
    it('getData() returns action.option.data or undefined', () => {
      const data = { prop: 1 };
      const actionWithData = {
        ...readyMadeAction,
        type: 'result1',
        options: {
          noStorage: true,
          syncronousCompletion: true,
          idleWhenActive: true,
          data,
        },
      };
      const actionWithoutData = {
        ...readyMadeAction,
        type: 'result2',
      };

      expect(getData(actionWithData)).toBe(data);
      expect(getData(actionWithoutData)).toBeUndefined();
    });
    it('hasMatchingDataProperty() returns true if action has data with given name and the value matches', () => {
      const data = { prop: 1, truthy: true, falsy: false, nullish: null };
      const actionWithData = {
        ...readyMadeAction,
        type: 'result1',
        options: {
          data,
        },
      };

      const actionWithoutData = {
        ...readyMadeAction,
        type: 'actionWithoutData',
      };

      const actionWithDataObject = {
        ...readyMadeAction,
        type: 'result2',
        options: {
          data: { data, prop2: 'hello' },
        },
      };

      expect(hasMatchingDataProperty(actionWithData, 'prop', 1)).toBeTruthy();
      expect(hasMatchingDataProperty(actionWithData, 'prop', true)).toBeFalsy();

      expect(
        hasMatchingDataProperty(actionWithData, 'truthy', true)
      ).toBeTruthy();
      expect(
        hasMatchingDataProperty(actionWithData, 'truthy', false)
      ).toBeFalsy();

      expect(
        hasMatchingDataProperty(actionWithData, 'falsy', false)
      ).toBeTruthy();
      expect(
        hasMatchingDataProperty(actionWithData, 'falsy', true)
      ).toBeFalsy();

      expect(
        hasMatchingDataProperty(actionWithData, 'nullish', null)
      ).toBeTruthy();
      expect(
        hasMatchingDataProperty(actionWithData, 'nullish', undefined)
      ).toBeFalsy();

      expect(
        hasMatchingDataProperty(actionWithData, 'notFound', undefined)
      ).toBeTruthy();

      expect(
        hasMatchingDataProperty(actionWithDataObject, 'data', data)
      ).toBeTruthy();
      expect(
        hasMatchingDataProperty(actionWithDataObject, 'prop2', 'hello')
      ).toBeTruthy();

      expect(
        hasMatchingDataProperty(actionWithoutData, 'complete', false)
      ).toBeFalsy();
      expect(
        hasMatchingDataProperty(actionWithoutData, 'type', 'actionWithoutData')
      ).toBeFalsy();
    });
  });
});
