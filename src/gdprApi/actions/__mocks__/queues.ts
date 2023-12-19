import { QueueProps } from '../queues';
import { createTriggerableExecutor } from '../../../common/actionQueue/mock.util';

const actual = jest.requireActual('../queues.ts');

export function getQueue(props: QueueProps) {
  return actual.getQueue(props).map(createTriggerableExecutor);
}
