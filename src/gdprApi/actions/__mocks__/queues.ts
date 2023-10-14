import {
  ActionProps,
  ActionExecutor,
} from '../../../common/actionQueue/actionQueue';
import { QueueProps } from '../queues';
import { runOrCreateExecutor, storeOriginalExecutor } from './mock.util';

const actual = jest.requireActual('../queues.ts');

const queueMockMapper = (actionProps: ActionProps) => {
  storeOriginalExecutor(actionProps);
  return {
    ...actionProps,
    executor: (...args: Parameters<ActionExecutor>) =>
      runOrCreateExecutor(...args),
  };
};

export function getQueue(props: QueueProps) {
  return actual.getQueue(props).map(queueMockMapper);
}
