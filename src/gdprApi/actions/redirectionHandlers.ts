import {
  ActionExecutor,
  ActionProps,
  ActionType,
} from '../../common/actionQueue/actionQueue';
import {
  RunnerFunctions,
  canQueueContinueFrom,
} from '../../common/actionQueue/actionQueueRunner';
import matchUrls from '../../common/helpers/matchUrls';
import config from '../../config';
import {
  createNextActionParams,
  rejectExecutorWithRedirection,
  resolveExecutorWithRedirection,
  thirtySecondsInMs,
} from './utils';

export const waitForDownloadPageRedirectionType =
  'waitForDownloadPageRedirection';
export const redirectToDownloadType = 'redirectToDownload';

export const shouldResumeWithDownloadRedirection = (
  controller: RunnerFunctions
): boolean =>
  canQueueContinueFrom(controller, waitForDownloadPageRedirectionType, true);

export const resumeQueueFromDownLoadPageRedirection = (
  runner: RunnerFunctions
) => {
  // test how error flows if this is forceed.
  if (runner.resume(waitForDownloadPageRedirectionType)) {
    return waitForDownloadPageRedirectionType;
  }
  return undefined;
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
  redirectorActionType: ActionType = 'redirector',
  catcherActionType: ActionType = 'redirectionCatcher'
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
    },
  };
  return [redirector, catcherProps];
};

export function createDownloadPageRedirectorAndCatcher() {
  return createRedirectorAndCatcherActionProps(
    config.downloadPath,
    redirectToDownloadType,
    waitForDownloadPageRedirectionType
  );
}
