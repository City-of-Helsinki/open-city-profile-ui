import { QueueProps, getQueue as getQueueFn } from '../queues';
import { createTriggerableExecutor } from '../../../common/actionQueue/mock.util';

export function getQueue(props: QueueProps) {
  return getQueueFn(props).map(createTriggerableExecutor);
}
