import { waitFor } from '@testing-library/react';

import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import {
  getFailingQueue,
  getSuccessfulQueue,
  rejectingActionSource,
  resolvingActionSource1,
  resolvingActionSource2,
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
    jest.resetAllMocks();
  });
  describe('getActionResultAndErrorMessage()', () => {
    it('returns result and error message of given action', async () => {
      const { runner } = initTests({ fail: true });
      const resolvingAction1Before = getActionResultAndErrorMessage(
        resolvingActionSource1.type,
        runner
      );
      expect(resolvingAction1Before.result).toBeUndefined();
      expect(resolvingAction1Before.errorMessage).toBeUndefined();
      runner.start();
      await waitFor(() => {
        expect(runner.isFinished()).toBeTruthy();
      });
      const resolvingAction1After = getActionResultAndErrorMessage(
        resolvingActionSource1.type,
        runner
      );
      expect(resolvingAction1After.result).toBe(
        resolvingActionSource1.resolveValue
      );
      expect(resolvingAction1After.errorMessage).toBeUndefined();
      const rejectingActionAfter = getActionResultAndErrorMessage(
        rejectingActionSource.type,
        runner
      );
      expect(rejectingActionAfter.result).toBeUndefined();
      expect(rejectingActionAfter.errorMessage).toBe(
        (rejectingActionSource.rejectValue as Error).message
      );
      const notRunExecutedAction = getActionResultAndErrorMessage(
        resolvingActionSource2.type,
        runner
      );
      expect(notRunExecutedAction.result).toBeUndefined();
      expect(notRunExecutedAction.errorMessage).toBeUndefined();
    });
    it('returns undefined values when given action is not found', async () => {
      const { runner } = initTests({ fail: true });
      const result = getActionResultAndErrorMessage('foo', runner);
      expect(result.result).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
    });
  });
});
