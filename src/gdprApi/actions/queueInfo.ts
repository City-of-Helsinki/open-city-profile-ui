import {
  Action,
  ActionExecutor,
  ActionProps,
  QueueController,
  getData,
} from '../../common/actionQueue/actionQueue';
import { StoredQueue } from '../../common/actionQueue/actionQueueStorage';

export const queueInfoActionType = 'queueInfo';

export const getQueueInfo = (queueController: QueueController) => {
  const action = queueController.getByType(queueInfoActionType) as Action;
  return getData(action);
};

export const getQueueInfoFromStoredQueue = (queue: StoredQueue) => {
  const infoAction = queue.find(action => action.type === queueInfoActionType);
  return infoAction ? getData(infoAction as Action) : undefined;
};

const queueInfoExecutor: ActionExecutor = async () => Promise.resolve(true);

export function createQueueInfoAction(queueName: string): ActionProps {
  return {
    type: queueInfoActionType,
    executor: queueInfoExecutor,
    data: {
      queueName,
    },
  };
}
