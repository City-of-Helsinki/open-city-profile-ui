import {
  ActionType,
  JSONStringifyableResult,
  QueueController,
} from '../../common/actionQueue/actionQueue';

export function getActionResultAndErrorMessage<T = JSONStringifyableResult>(
  actionType: ActionType,
  controller: QueueController
): { result: T | undefined; errorMessage: string | undefined } {
  const action = controller.getByType(actionType);
  if (!action) {
    return {
      result: undefined,
      errorMessage: undefined,
    };
  }
  const { result, errorMessage } = action;
  return {
    result: (result as unknown) as T,
    errorMessage,
  };
}
