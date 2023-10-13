import to from 'await-to-js';

import { createRedirectorAndCatcherActionProps } from '../redirectionHandlers';
import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import mockWindowLocation from '../../../common/test/mockWindowLocation';
import { AnyObject } from '../../../graphql/typings';
import {
  createFailedActionParams,
  createNextActionParams,
  thirtySecondsInMs,
} from '../utils';

describe('redirectionHandlers.ts', () => {
  const expectedPath = '/expected-path';
  const wrongPath = '/wrong-path';
  const redirectorType = 'a-redirector';
  const catcherType = 'a-catcher';
  const [redirector, catcher] = createRedirectorAndCatcherActionProps(
    expectedPath,
    redirectorType,
    catcherType
  );
  const mockedWindowControls = mockWindowLocation();
  const initTests = () => {
    const queue = [redirector, catcher];
    const runner = createActionQueueRunner(queue);
    return {
      runner,
      getRedirectorAction: () => runner.getByType(redirector.type) as Action,
      getCatcherAction: () => runner.getByType(catcher.type) as Action,
    };
  };

  const resolvePath = `${expectedPath}?${createNextActionParams(catcher)}`;
  const rejectionPath = `${expectedPath}?${createFailedActionParams(catcher)}`;

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

  describe(`createRedirectorAndCatcherActionProps() creates an action that redirects and 
            an action that catches the redirection.`, () => {
    describe(`redirector action`, () => {
      it('sets the given path and catcher action type to the url. Result is path?next=action.type', async () => {
        const { runner, getRedirectorAction } = initTests();
        const action = getRedirectorAction();
        const [, result] = ((await to(
          action.executor(action, runner)
        )) as unknown) as [undefined, AnyObject];
        expect(result.isRedirectionRequest).toBeTruthy();
        expect(result.path as string).toBe(resolvePath);
      });
    });

    describe(`catcher action resolves with "true" and 
              rejects with an error including redirection to given path and failed action type`, () => {
      it('Resolves to true, if path and next action in the url match.', async () => {
        const { runner, getCatcherAction } = initTests();

        mockedWindowControls.setPath(expectedPath);
        mockedWindowControls.setSearch(
          createNextActionParams(getCatcherAction())
        );
        const waitAction = getCatcherAction();
        const promise = waitAction.executor(waitAction, runner);
        const waitResult = await promise;
        expect(waitResult).toBeTruthy();
      });
      it('Rejects when next action type in the url does not match.', async () => {
        const { runner, getCatcherAction } = initTests();

        mockedWindowControls.setPath(expectedPath);
        mockedWindowControls.setSearch(
          createNextActionParams({ type: 'wrongAction' } as Action)
        );
        const waitAction = getCatcherAction();
        const promise = waitAction.executor(waitAction, runner);
        jest.advanceTimersByTime(thirtySecondsInMs + 1);
        const [error] = await to(promise);
        expect(error?.message.includes(rejectionPath)).toBeTruthy();
      });
      it('Rejects when path in the url does not match', async () => {
        const { runner, getCatcherAction } = initTests();

        const waitAction = getCatcherAction();
        mockedWindowControls.setPath(wrongPath);
        mockedWindowControls.setSearch(createNextActionParams(waitAction));
        const promise = waitAction.executor(waitAction, runner);
        jest.advanceTimersByTime(thirtySecondsInMs + 1);
        const [error] = await to(promise);
        expect(error?.message.includes(rejectionPath)).toBeTruthy();
      });
    });
  });
});
