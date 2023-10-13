import {
  ActionProps,
  ActionExecutor,
} from '../../../common/actionQueue/actionQueue';
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

export function getQueue(
  name: 'downloadProfile' | 'deleteProfile' | 'removeServiceConnection',
  path: string
) {
  return actual.getQueue(name, path).map(queueMockMapper);
}
