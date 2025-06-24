import {
  Action,
  ActionExecutor,
  ActionProps,
  ActionType,
  QueueController,
  getData,
  hasMatchingDataProperty,
  isResumable,
} from '../../common/actionQueue/actionQueue';
import {
  QueueRunner,
  resumeQueueFromAction,
} from '../../common/actionQueue/actionQueueRunner';
import matchUrls from '../../common/helpers/matchUrls';
import {
  createNextActionParams,
  isOnActionRequiredPath,
  rejectExecutorWithRedirection,
  resolveExecutorWithRedirection,
  thirtySecondsInMs,
} from './utils';

export const defaultRedirectorActionType = 'redirector';
export const defaultRedirectionCatcherActionType = 'redirectionCatcher';

export const resumeQueueFromRedirectionCatcher = (
  runner: QueueRunner,
  catcherActionType = defaultRedirectionCatcherActionType
) => resumeQueueFromAction(runner, catcherActionType);

export const isResumableRedirectionCatcher = (action: Action) => {
  if (
    !isResumable(action) ||
    !hasMatchingDataProperty(action, 'isRedirectionCatcher', true)
  ) {
    return false;
  }
  return isOnActionRequiredPath(action);
};

export const isWaitingForRedirectionCatcher = (action: Action) =>
  action.active && !isOnActionRequiredPath(action);

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
    .map((action) => getData(action, 'startPagePath'))
    .filter((v) => !!v);
  return startPagePaths[0] as string | undefined;
};

const createRedirectionCatcherExecutor =
  (targetPath: string, catcherActionType: ActionType): ActionExecutor =>
  async (action) => {
    const checkMatch = () =>
      matchUrls(
        `${targetPath}?${createNextActionParams({
          type: catcherActionType,
        } as ActionProps)}`
      );
    if (checkMatch()) {
      return Promise.resolve(true);
    }
    // There might be a delay until useInternalRedirect() hook redirects.
    // This occurs when there are no actual browser redirects. For example when there are no auth codes to get.
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
    return checkMatch()
      ? Promise.resolve(true)
      : rejectExecutorWithRedirection(
          targetPath,
          action,
          `Redirection to ${targetPath} page timed out.`,
          thirtySecondsInMs
        );
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
      resumable: true,
    },
    data: {
      isRedirectionCatcher: true,
      requiredPath: targetPath,
    },
  };

  const redirector: ActionProps = {
    type: redirectorActionType,
    executor: () => resolveExecutorWithRedirection(targetPath, catcherProps),
    options: {
      noStorage: true,
    },
    data: {
      startPagePath: targetPath,
      redirectsInternally: true,
    },
  };
  return [redirector, catcherProps];
};
