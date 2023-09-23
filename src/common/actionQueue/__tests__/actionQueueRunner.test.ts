import { getMockCalls } from '../../test/jestMockHelper';
import {
  Action,
  ActionExecutor,
  ActionProps,
  ActionType,
  InitialQueue,
} from '../actionQueue';
import {
  LogType,
  Logger,
  RunnerFunctions,
  actionLogTypes,
  createActionQueueRunner,
  isGenericError,
} from '../actionQueueRunner';
import {
  convertSourceToActionProps,
  resolvingAction1,
  resolvingAction2,
  readyMadeAction,
  ActionSourceForTesting,
  rejectingAction,
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
  let runner: RunnerFunctions;

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

      // actions are should be complete and not active
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
});
