import { waitFor } from '@testing-library/react';

import { getMockCalls } from '../../test/jestMockHelper';
import {
  Action,
  ActionExecutor,
  ActionProps,
  ActionType,
  InitialQueue,
} from '../actionQueue';
import {
  ActionStatus,
  LogType,
  Logger,
  QueueRunner,
  actionLogTypes,
  createActionQueueRunner,
  genericErrorTypes,
  isGenericError,
} from '../actionQueueRunner';
import {
  convertSourceToActionProps,
  resolvingAction1,
  resolvingAction2,
  readyMadeAction,
  ActionSourceForTesting,
  rejectingAction,
  getSuccessfulQueue,
} from '../test.util';

describe('actionQueueRunner', () => {
  const executeLogType = 'execute' as const;
  type TrackingType = LogType | typeof executeLogType;
  type TrackingData = {
    trackingType?: TrackingType;
    actionType?: ActionType;
    time?: number;
  };
  // holds all tracking data
  const tracker = jest.fn();

  // track when an action is executed, started, completed or an error is logged.
  const track = (trackingType: TrackingType, actionType: ActionType) => {
    tracker({ trackingType, actionType, time: Date.now() });
  };
  let runner: QueueRunner;

  // wrap action.executor so tracker is called when an action is executed.
  const trackExecutor = (targetAction: ActionProps) => {
    const { type, executor } = targetAction;
    const wrapper: ActionExecutor = (action, queueFunctions) => {
      track(executeLogType, type);
      return executor(action, queueFunctions);
    };
    return { ...targetAction, executor: wrapper };
  };

  // get all tracked data
  const getTrackingData = (): TrackingData[] => {
    const calls = getMockCalls(tracker) as [TrackingData][];
    return calls.map((data: [TrackingData]) => data[0]);
  };

  // map tracked data to {trackingType}:{actionType} for easy string comparison
  const mapTrackingData = (data: TrackingData) =>
    `${data.trackingType}:${data.actionType}`;

  // map common action execution logging types to {trackingType}:{actionType} for easy string comparison
  const mapLogTypes = (list: TrackingType[], actionType: ActionType) =>
    list
      .map(trackingType => ({ trackingType, actionType } as TrackingData))
      .map(mapTrackingData);

  // use mapLogTypes() to make an array of log types of a successful action execution
  const getSuccessLogDataForAction = (
    action: Action | ActionSourceForTesting | ActionProps
  ) =>
    mapLogTypes(
      [executeLogType, actionLogTypes.started, actionLogTypes.completed],
      action.type
    );

  // use mapLogTypes() to make an array of log types of a failed action execution
  const getErrorLogDataForAction = (
    action: Action | ActionSourceForTesting | ActionProps
  ) =>
    mapLogTypes(
      [executeLogType, actionLogTypes.started, actionLogTypes.error],
      action.type
    );

  // use mapLogTypes() to make an array of log types of started action execution
  const getActiveLogDataForAction = (
    action: Action | ActionSourceForTesting | ActionProps
  ) => mapLogTypes([executeLogType, actionLogTypes.started], action.type);

  // get results of all actions
  const getResults = () => runner.getQueue().map(action => action.result);

  // wraps runner to a promise which is resolved when queue is finished.
  // easier to use a promise to wait for queue completion in tests.
  // also wraps all executors with trackExecutor
  // also tracks all logged actions
  const createPromiseForRunner = (initialQueue: InitialQueue) =>
    new Promise(resolve => {
      const logger: Logger = (type, action, queueFunctions) => {
        track(type, action ? action.type : 'no-action');
        if (queueFunctions.isFinished()) {
          resolve(true);
        }
        if (isGenericError(type)) {
          resolve(false);
        }
      };
      runner = createActionQueueRunner(initialQueue.map(trackExecutor), logger);
      runner.start();
    });

  afterEach(() => {
    tracker.mockReset();
    if (runner) {
      runner.dispose();
    }
  });
  describe('createActionQueueRunner', () => {
    it('creates a new runner and an actionQueue', () => {
      runner = createActionQueueRunner([{ ...readyMadeAction }]);
      expect(runner.getQueue()).toHaveLength(1);
    });
    it('Also throws when adding actions with same type', () => {
      expect(() => {
        createActionQueueRunner([
          { ...readyMadeAction },
          { ...readyMadeAction },
        ]);
      }).toThrow();
    });
  });
  describe('start()', () => {
    it('starts running the queue from the first action to the last.', async () => {
      await createPromiseForRunner([
        convertSourceToActionProps({ ...resolvingAction1 }),
        convertSourceToActionProps({ ...resolvingAction2 }),
      ]);

      // actions are run in the order they are in the queue
      // successful tracked sequence is 'execute', 'start', 'complete'
      // logged data is mapped and compared to assumed logging order
      expect(getTrackingData().map(mapTrackingData)).toEqual([
        ...getSuccessLogDataForAction(resolvingAction1),
        ...getSuccessLogDataForAction(resolvingAction2),
      ]);

      // results must match
      expect(getResults()).toEqual([
        resolvingAction1.resolveValue,
        resolvingAction2.resolveValue,
      ]);

      // actions should be complete and not active
      expect(runner.getQueue()).toMatchObject([
        {
          type: resolvingAction1.type,
          result: resolvingAction1.resolveValue,
          complete: true,
          active: false,
        },
        {
          type: resolvingAction2.type,
          result: resolvingAction2.resolveValue,
          complete: true,
          active: false,
        },
      ]);
    });
    it('logs a generic error when first action is not executable', async () => {
      await createPromiseForRunner([
        {
          ...convertSourceToActionProps({ ...resolvingAction1 }),
          complete: true,
        } as ActionProps,
        convertSourceToActionProps({ ...resolvingAction2 }),
      ]);

      expect(
        isGenericError(getTrackingData()[0].trackingType as LogType)
      ).toBeTruthy();
    });
    it('starts running the queue from the first action error one.', async () => {
      await createPromiseForRunner([
        convertSourceToActionProps({ ...resolvingAction1 }),
        convertSourceToActionProps({ ...rejectingAction }),
        convertSourceToActionProps({ ...resolvingAction2 }),
      ]);

      // actions are run in the order they are in the queue
      // successful tracked sequence is 'execute', 'start', 'complete'
      // logged data is mapped to {trackingType}:{actionType}
      // which is compared to the array returned from getSuccessLogDataForAction
      expect(getTrackingData().map(mapTrackingData)).toEqual([
        ...getSuccessLogDataForAction(resolvingAction1),
        ...getErrorLogDataForAction(rejectingAction),
      ]);
      // results must match
      expect(getResults()).toEqual([
        resolvingAction1.resolveValue,
        undefined,
        undefined,
      ]);
      expect(runner.getFailed()).toMatchObject({
        errorMessage: (rejectingAction.rejectValue as Error).message,
        type: rejectingAction.type,
        result: undefined,
        complete: true,
        active: false,
      });
    });
  });
  describe('resume()', () => {
    const initTest = (props: Partial<Action>[]) => {
      runner = createActionQueueRunner(
        getSuccessfulQueue(props).map(trackExecutor),
        (type, action) => track(type, action ? action.type : 'no-action')
      );
    };

    const initTestAndExpectError = async (
      props: Partial<Action>[],
      resumeAction: Action | ActionProps | ActionSourceForTesting,
      error: TrackingData
    ) => {
      initTest(props);
      runner.resume(resumeAction.type);
      await waitFor(() => {
        expect(getTrackingData().map(mapTrackingData)).toEqual([
          mapTrackingData(error),
        ]);
      });
    };

    it('starts running the queue from the action matching the given type - if possible', async () => {
      initTest([{ complete: true }]);
      runner.resume(resolvingAction2.type);
      await waitFor(() => {
        expect(getTrackingData().map(mapTrackingData)).toEqual([
          ...getSuccessLogDataForAction(resolvingAction2),
        ]);
      });
    });
    it('logs CANNOT_EXECUTE_ACTION_IS_COMPLETE error if given action is complete', async () => {
      await initTestAndExpectError([{ complete: true }], resolvingAction1, {
        trackingType: genericErrorTypes.CANNOT_EXECUTE_ACTION_IS_COMPLETE,
        actionType: resolvingAction1.type,
      });
    });
    it('logs an CANNOT_EXECUTE_ACTION_IS_ACTIVE error if given action is active', async () => {
      await initTestAndExpectError([{ active: true }], resolvingAction1, {
        trackingType: genericErrorTypes.CANNOT_EXECUTE_ACTION_IS_ACTIVE,
        actionType: resolvingAction1.type,
      });
    });
    it('logs an UNKNOWN_ACTION_TYPE error if given action is invalid', async () => {
      await initTestAndExpectError(
        [],
        { type: 'notFound' },
        {
          trackingType: genericErrorTypes.UNKNOWN_ACTION_TYPE,
          actionType: 'no-action',
        }
      );
    });
    it('logs an CANNOT_EXECUTE_ACTION_IS_NOT_NEXT error if given action is not next', async () => {
      await initTestAndExpectError([], resolvingAction2, {
        trackingType: genericErrorTypes.CANNOT_EXECUTE_ACTION_IS_NOT_NEXT,
        actionType: resolvingAction2.type,
      });
    });
    it('logs an CANNOT_EXECUTE_ANOTHER_ACTION_IS_ACTIVE error if another action is active', async () => {
      await initTestAndExpectError([{ active: true }], resolvingAction2, {
        trackingType: genericErrorTypes.CANNOT_EXECUTE_ANOTHER_ACTION_IS_ACTIVE,
        actionType: resolvingAction2.type,
      });
    });
  });
  describe('getActionStatus()', () => {
    const initTest = (props: Partial<Action>[]) => {
      runner = createActionQueueRunner(getSuccessfulQueue(props));
    };

    const initTestAndExpectStatus = async (
      props: Partial<Action>[],
      action: Partial<Action>,
      status: ActionStatus
    ) => {
      initTest(props);
      await waitFor(() => {
        expect(runner.getActionStatus(action as Action)).toBe(status);
      });
    };

    it('returns action status "complete" if given action is complete', async () => {
      await initTestAndExpectStatus(
        [{ complete: true }],
        resolvingAction1,
        'complete'
      );
    });
    it('returns action status "active" if given action is active, but a promise is not pending', async () => {
      await initTestAndExpectStatus(
        [{ active: true }],
        resolvingAction1,
        'active'
      );
    });
    it('returns action status "pending" if given action has been executed', async () => {
      initTest([]);
      runner.start();
      expect(runner.getActionStatus(resolvingAction1.type)).toBe('pending');
    });
    it('returns action status "next" if given action is not active, but next in queue', async () => {
      await initTestAndExpectStatus([], resolvingAction1, 'next');
    });
    it('returns action status "not-next" if no action is active, but given action is not next in queue', async () => {
      await initTestAndExpectStatus([], resolvingAction2, 'not-next');
    });
    it('returns action status "in-queue" if an action is active and given action queued', async () => {
      await initTestAndExpectStatus(
        [{ active: true }],
        resolvingAction2,
        'in-queue'
      );
    });
    it('returns action status "invalid" if an action is not found', async () => {
      await initTestAndExpectStatus([], { type: 'notFound' }, 'invalid');
    });
  });
  describe('getPromise()', () => {
    it('returns current pending promise if any', async () => {
      runner = createActionQueueRunner([{ ...readyMadeAction }]);
      expect(runner.getPromise()).toBeUndefined();
      runner.start();
      expect(runner.getPromise()).toBeDefined();
      await runner.getPromise();
      expect(runner.getPromise()).toBeUndefined();
    });
  });
  describe('dispose()', () => {
    const initTest = () => {
      runner = createActionQueueRunner(
        getSuccessfulQueue().map(trackExecutor),
        (type, action) => track(type, action ? action.type : 'no-action')
      );
    };
    it('clears the queue', async () => {
      initTest();
      expect(runner.getQueue()).toHaveLength(2);
      runner.dispose();
      expect(runner.getQueue()).toHaveLength(0);
    });
    it('clears pending promises', async () => {
      initTest();
      runner.start();
      expect(runner.getPromise()).toBeDefined();
      runner.dispose();
      expect(runner.getPromise()).toBeUndefined();
    });
    it('started promises will not trigger changes.', async () => {
      initTest();
      runner.start();
      const promise = runner.getPromise();
      expect(getTrackingData().map(mapTrackingData)).toEqual([
        ...getActiveLogDataForAction(resolvingAction1),
      ]);
      runner.dispose();
      await promise;
      expect(getTrackingData().map(mapTrackingData)).toEqual([
        ...getActiveLogDataForAction(resolvingAction1),
      ]);
    });
  });
  describe('Action is completed in sync when action.options.syncronousCompletion is "true"', () => {
    const initTest = () => {
      runner = createActionQueueRunner(
        getSuccessfulQueue([{ options: { syncronousCompletion: true } }]).map(
          trackExecutor
        ),
        (type, action) => track(type, action ? action.type : 'no-action')
      );
    };
    it('Action.complete is set to true and logged. The queue advances after the promise is resolved', async () => {
      initTest();
      runner.start();
      const promise = runner.getPromise();
      expect(getTrackingData().map(mapTrackingData)).toEqual([
        ...getSuccessLogDataForAction(resolvingAction1),
      ]);
      // even if the action was completed, next one is not started until promise is resolved.
      expect(runner.getActive()).toBeUndefined();
      await promise;
      expect(getTrackingData().map(mapTrackingData)).toEqual([
        ...getSuccessLogDataForAction(resolvingAction1),
        ...getActiveLogDataForAction(resolvingAction2),
      ]);
    });
  });
  describe('reset()', () => {
    it('Resets the queue and a "reset" log type is logged', async () => {
      await createPromiseForRunner([
        convertSourceToActionProps({ ...resolvingAction1 }),
        convertSourceToActionProps({ ...rejectingAction }),
      ]);
      runner.reset();
      await waitFor(() => {
        expect(getTrackingData().map(mapTrackingData)).toEqual([
          ...getSuccessLogDataForAction(resolvingAction1),
          ...getErrorLogDataForAction(rejectingAction),
          'reset:no-action',
        ]);
      });
    });
  });
});
