import to from 'await-to-js';

import { createDownloadPageRedirectorAndCatcher } from '../redirectionHandlers';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import mockWindowLocation from '../../../common/test/mockWindowLocation';
import { AnyObject } from '../../../graphql/typings';
import { createNextActionParams, thirtySecondsInMs } from '../utils';
import config from '../../../config';

describe('redirectionHandlers.ts', () => {
  const [
    redirectToDownloadAction,
    waitForDownloadPageRedirectionAction,
  ] = createDownloadPageRedirectorAndCatcher();
  const mockedWindowControls = mockWindowLocation();
  const initTests = () => {
    const queue = [
      redirectToDownloadAction,
      waitForDownloadPageRedirectionAction,
    ];
    const runner = createActionQueueRunner(queue);
    return {
      runner,
      getRedirectToDownloadAction: () =>
        runner.getByType(redirectToDownloadAction.type) as Action,
      getWaitForDownloadPageRedirectionAction: () =>
        runner.getByType(waitForDownloadPageRedirectionAction.type) as Action,
    };
  };

  afterAll(() => {
    mockedWindowControls.restore();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    mockedWindowControls.reset();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe(`redirectToDownloadAction() resovels with redirection data in the result.  
            The result has "waitForDownloadPageRedirectionAction" as next action in the url`, () => {
    it('Redirection data is stored. Redirection is not done by the action', async () => {
      const { runner, getRedirectToDownloadAction } = initTests();
      const action = getRedirectToDownloadAction();
      const [, result] = ((await to(
        action.executor(action, runner)
      )) as unknown) as [undefined, AnyObject];
      expect(result.isRedirectionRequest).toBeTruthy();
      expect(
        (result.path as string).includes(
          waitForDownloadPageRedirectionAction.type
        )
      ).toBeTruthy();
    });
  });

  describe(`waitForDownloadPageRedirectionAction() waits for download path to be  
            with "waitForDownloadPageRedirectionAction" as next action in url`, () => {
    it('Resolves to true if page and next action match.', async () => {
      const { runner, getWaitForDownloadPageRedirectionAction } = initTests();

      mockedWindowControls.setPath(config.downloadPath);
      mockedWindowControls.setSearch(
        createNextActionParams(getWaitForDownloadPageRedirectionAction())
      );
      const waitAction = getWaitForDownloadPageRedirectionAction();
      const promise = waitAction.executor(waitAction, runner);
      const waitResult = await promise;
      expect(waitResult).toBeTruthy();
    });
    it('Rejects with redirection request if executor times out.', async () => {
      const { runner, getWaitForDownloadPageRedirectionAction } = initTests();

      mockedWindowControls.setPath(config.downloadPath);
      mockedWindowControls.setSearch(
        createNextActionParams({ type: 'wrongAction' } as Action)
      );
      const waitAction = getWaitForDownloadPageRedirectionAction();
      const promise = waitAction.executor(waitAction, runner);
      jest.advanceTimersByTime(thirtySecondsInMs + 1);
      const [error] = await to(promise);
      expect(
        error?.message.includes(
          `${config.downloadPath}?error=${waitForDownloadPageRedirectionAction.type}`
        )
      ).toBeTruthy();
    });
  });
});
