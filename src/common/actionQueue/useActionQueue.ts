import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ActionType, InitialQueue } from './actionQueue';
import {
  LogType,
  Logger,
  RunnerFunctions,
  createActionQueueRunner,
  isGenericError,
} from './actionQueueRunner';

export type QueueState = {
  lastActionType: ActionType | undefined;
  lastLogType: LogType | undefined;
  isComplete: boolean;
  hasError: boolean;
  isActive: boolean;
};

export type HookFunctions = {
  isValid: () => boolean;
  dispose: () => void;
  reset: () => void;
  getQueueRunner: () => RunnerFunctions;
  state: QueueState;
};

export function useActionQueue(initialQueueProps: InitialQueue): HookFunctions {
  const [, update] = useState(0);
  const queueStateRef = useRef<QueueState>({
    lastActionType: undefined,
    lastLogType: undefined,
    isComplete: false,
    hasError: false,
    isActive: false,
  });

  const functionsHaveBeenMemoized = useRef<boolean>(false);

  const forceRerender = useCallback(() => {
    update(num => num + 1);
  }, [update]);

  const functions = useMemo(() => {
    if (functionsHaveBeenMemoized.current) {
      throw new Error(
        'useActionQueue useMemo() was called twice. Passed "initialQueueProps" MUST BE memoized to avoid this.'
      );
    }
    functionsHaveBeenMemoized.current = true;
    const logger: Logger = (type, action, controller) => {
      const newState: QueueState = queueStateRef.current;

      if (controller.getFailed()) {
        newState.hasError = true;
      }
      if (controller.isFinished()) {
        newState.isComplete = true;
      }
      if (action) {
        if (type === 'started') {
          newState.lastActionType = action.type;
          newState.isActive = true;
        }
        if (type === 'completed' || type === 'error') {
          newState.isActive = false;
        }
      }
      if (type === 'error' || isGenericError(type)) {
        newState.hasError = true;
      }
      newState.lastLogType = type;
      queueStateRef.current = newState;
      forceRerender();
    };
    const runner = createActionQueueRunner(initialQueueProps, logger);
    const dispose = () => {
      runner.dispose();
    };
    const reset = () => {
      runner.reset();
    };

    const isValid: HookFunctions['isValid'] = () =>
      runner.getQueue().length > 0;

    return {
      getQueueRunner: () => runner,
      dispose,
      isValid,
      reset,
    };
  }, [initialQueueProps, forceRerender]);

  useEffect(
    () => () => {
      functions.getQueueRunner().dispose();
    },
    [functions]
  );
  return {
    ...functions,
    state: queueStateRef.current,
  };
}
