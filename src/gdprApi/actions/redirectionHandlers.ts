import {
  ActionExecutor,
  ActionProps,
} from '../../common/actionQueue/actionQueue';
import { RunnerFunctions } from '../../common/actionQueue/actionQueueRunner';
import {
  getNextActionFromUrl,
  isDownloadPageUrl,
  rejectExecutorWithDownloadPageRedirection,
  resolveExecutorWithDownloadPageRedirection,
  thirtySecondsInMs,
} from './utils';

const waitForDownloadPageRedirectionType = 'waitForDownloadPageRedirection';

const waitForDownloadPageRedirectionExecutor: ActionExecutor = async action => {
  const nextActionInUrl = getNextActionFromUrl();
  if (
    !isDownloadPageUrl() ||
    nextActionInUrl !== waitForDownloadPageRedirectionType
  ) {
    return rejectExecutorWithDownloadPageRedirection(
      action,
      'Redirection to download page timed out.',
      thirtySecondsInMs
    );
  }
  return Promise.resolve(true);
};

export const shouldResumeWithDownloadRedirection = (
  controller: RunnerFunctions
): boolean => {
  const status = controller.getActionStatus(waitForDownloadPageRedirectionType);
  return status === 'next' || status === 'pending';
};

export const resumeQueueFromDownLoadPageRedirection = (
  runner: RunnerFunctions
) => {
  // test how error flows if this is forceed.
  if (runner.resume(waitForDownloadPageRedirectionType)) {
    return waitForDownloadPageRedirectionType;
  }
  return undefined;
};

export const waitForDownloadPageRedirectionAction: ActionProps = {
  type: waitForDownloadPageRedirectionType,
  executor: waitForDownloadPageRedirectionExecutor,
  options: {
    noStorage: true,
    idleWhenActive: true,
  },
};

const redirectToDownloadType = 'redirectToDownload';

const redirectToDownloadExecutor: ActionExecutor = async () =>
  resolveExecutorWithDownloadPageRedirection(
    waitForDownloadPageRedirectionAction
  );

export const redirectToDownloadAction: ActionProps = {
  type: redirectToDownloadType,
  executor: redirectToDownloadExecutor,
  options: {
    noStorage: true,
  },
};
