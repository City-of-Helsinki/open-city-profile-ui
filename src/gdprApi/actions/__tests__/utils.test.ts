import fetchMock from 'jest-fetch-mock';
import to from 'await-to-js';
import { waitFor } from '@testing-library/react';

import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import {
  getFailingQueue,
  getSuccessfulQueue,
  rejectingAction,
  resolvingAction1,
  resolvingAction2,
} from '../../../common/actionQueue/test.util';
import { getActionResultAndErrorMessage } from '../utils';

describe('utils.ts', () => {
  const initTests = ({ fail }: { fail?: boolean } = {}) => {
    const queue = fail ? getFailingQueue() : getSuccessfulQueue();
    const runner = createActionQueueRunner(queue);
    return {
      runner,
    };
  };
  afterEach(() => {
    fetchMock.resetMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('getActionResultAndErrorMessage()', () => {
    it('returns result and error message of given action', async () => {
      const { runner } = initTests({ fail: true });
      const resolvingAction1Before = getActionResultAndErrorMessage(
        resolvingAction1.type,
        runner
      );
      expect(resolvingAction1Before.result).toBeUndefined();
      expect(resolvingAction1Before.errorMessage).toBeUndefined();
      runner.start();
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      const resolvingAction1After = getActionResultAndErrorMessage(
        resolvingAction1.type,
        runner
      );
      expect(resolvingAction1After.result).toBe(resolvingAction1.resolveValue);
      expect(resolvingAction1After.errorMessage).toBeUndefined();
      const rejectingActionAfter = getActionResultAndErrorMessage(
        rejectingAction.type,
        runner
      );
      expect(rejectingActionAfter.result).toBeUndefined();
      expect(rejectingActionAfter.errorMessage).toBe(
        (rejectingAction.rejectValue as Error).message
      );
      const notRunExecutedAction = getActionResultAndErrorMessage(
        resolvingAction2.type,
        runner
      );
      expect(notRunExecutedAction.result).toBeUndefined();
      expect(notRunExecutedAction.errorMessage).toBeUndefined();
    });
    it('returns undefined  values when given type is not found', async () => {
      const { runner } = initTests({ fail: true });
      const result = getActionResultAndErrorMessage('foo', runner);
      expect(result.result).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
    });
  });
});
