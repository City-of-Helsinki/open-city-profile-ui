import {
  ActionProps,
  ActionExecutor,
} from '../../../common/actionQueue/actionQueue';
import { runOrCreateExecutor, storeOriginalExecutor } from './mock.util';

const actual = jest.requireActual('../queues.ts');

const downloadDataQueueWithMocks = actual.downloadDataQueue.map(
  (actionProps: ActionProps) => {
    storeOriginalExecutor(actionProps);
    return {
      ...actionProps,
      executor: (...args: Parameters<ActionExecutor>) =>
        runOrCreateExecutor(...args),
    };
  }
);

export const downloadDataQueue = downloadDataQueueWithMocks;
