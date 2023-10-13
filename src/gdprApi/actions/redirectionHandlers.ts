import {
  ActionExecutor,
  ActionProps,
  ActionType,
  QueueController,
  getData,
} from '../../common/actionQueue/actionQueue';
import {
  RunnerFunctions,
  canQueueContinueFrom,
  resumeQueueFromAction,
} from '../../common/actionQueue/actionQueueRunner';
import matchUrls from '../../common/helpers/matchUrls';
import {
  createNextActionParams,
  rejectExecutorWithRedirection,
  resolveExecutorWithRedirection,
  thirtySecondsInMs,
} from './utils';

export const defaultRedirectorActionType = 'redirector';
export const defaultRedirectionCatcherActionType = 'redirectionCatcher';

export const canResumeWithRedirectionCatcher = (
  controller: RunnerFunctions,
  catcherActionType = defaultRedirectionCatcherActionType
): boolean => canQueueContinueFrom(controller, catcherActionType, true);

export const resumeQueueFromRedirectionCatcher = (
  runner: RunnerFunctions,
  catcherActionType = defaultRedirectionCatcherActionType
) => resumeQueueFromAction(runner, catcherActionType);

export const getStartPagePathFromQueue = (
  controller: QueueController,
  redirectorActionType = defaultRedirectorActionType
): string | undefined => {
  const redirector = controller.getByType(redirectorActionType);
  if (redirector) {
    const path = getData(redirector, 'path');
    if (path) {
      return path as string;
    }
  }
  const startPagePaths = controller
    .getQueue()
    .map(action => getData(action, 'startPagePath'))
    .filter(v => !!v);
  return startPagePaths[0] as string | undefined;
};

const createRedirectionCatcherExecutor = (
  targetPath: string,
  catcherActionType: ActionType,
  timeout = thirtySecondsInMs
): ActionExecutor => async action => {
  const isUrlMatch = matchUrls(
    `${targetPath}?${createNextActionParams({
      type: catcherActionType,
    } as ActionProps)}`
  );
  if (!isUrlMatch) {
    return rejectExecutorWithRedirection(
      targetPath,
      action,
      `Redirection to ${targetPath} page timed out.`,
      timeout
    );
  }
  return Promise.resolve(true);
};

export const createRedirectorAndCatcherActionProps = (
  targetPath: string,
  redirectorActionType: ActionType = defaultRedirectorActionType,
  catcherActionType: ActionType = defaultRedirectionCatcherActionType
): [ActionProps, ActionProps] => {
  const catcherProps: ActionProps = {
    type: catcherActionType,
    executor: createRedirectionCatcherExecutor(targetPath, catcherActionType),
    options: {
      noStorage: true,
      idleWhenActive: true,
    },
  };

  const redirector: ActionProps = {
    type: redirectorActionType,
    executor: () => resolveExecutorWithRedirection(targetPath, catcherProps),
    options: {
      noStorage: true,
      data: {
        startPagePath: targetPath,
      },
    },
  };
  return [redirector, catcherProps];
};
