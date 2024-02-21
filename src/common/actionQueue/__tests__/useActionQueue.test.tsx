import React, { useMemo, useState } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { QueueState, useActionQueue } from '../useActionQueue';
import {
  ActionSourceForTesting,
  cloneArray,
  pickUpdateActionProps,
  rejectingActionSource,
  resolvingActionSource1,
  resolvingActionSource2,
} from '../test.util';
import { Action, ActionQueue, createQueueFromProps } from '../actionQueue';
import { getStoredQueue, storeQueue } from '../actionQueueStorage';
import {
  cleanMockData,
  completeActionExecutor,
  createActionWithTriggerableExecutor,
  isActionTriggered,
} from '../mock.util';

type TestComponentProps = { fail?: boolean; storageKey?: string };

describe('useActionQueue', () => {
  const elementIds = {
    lastActionType: 'last-action-type',
    isComplete: 'is-complete',
    startButton: 'start-button',
    renderCount: 'render-count',
    reRenderButton: 're-render',
    hasError: 'has-error',
    isActive: 'is-active',
    lastLogType: 'last-log-type',
    unmountButton: 'unmount-button',
    nextAction: 'next-action',
    activeAction: 'active-action',
    queueDump: 'queue-dump',
    resumeButton: 'resume-button',
    resetButton: 'reset-button',
  };

  const createActionProps = (props: ActionSourceForTesting) => ({
    ...createActionWithTriggerableExecutor(props),
    result: `Result for action ${props.type}`,
  });

  const getSuccessfulQueueWithResult = () => [
    {
      ...createActionProps(resolvingActionSource1),
    },
    {
      ...createActionProps(resolvingActionSource2),
    },
  ];

  const getFailingQueueWithResult = () => [
    {
      ...createActionProps(resolvingActionSource1),
    },
    {
      ...createActionProps(rejectingActionSource),
    },
    {
      ...createActionProps(resolvingActionSource2),
    },
  ];

  const TestUseActionQueueHook = (props: TestComponentProps = {}) => {
    const { fail, storageKey } = props;
    const queue = useMemo(
      () =>
        fail ? getFailingQueueWithResult() : getSuccessfulQueueWithResult(),
      [fail]
    );
    const [renderCount, rerender] = useState(0);
    const forceRender = () => {
      rerender(n => n + 1);
    };
    const { state, getQueueRunner, reset } = useActionQueue(queue, storageKey);
    const {
      lastActionType,
      isComplete,
      lastLogType,
      hasError,
      isActive,
    } = state;

    const next = getQueueRunner().getNext();
    const active = getQueueRunner().getActive();

    return (
      <div>
        <span id={elementIds.lastActionType}>{lastActionType}</span>
        <span id={elementIds.isComplete}>{String(isComplete)}</span>
        <span id={elementIds.hasError}>{String(hasError)}</span>
        <span id={elementIds.isActive}>{String(isActive)}</span>
        <span id={elementIds.lastLogType}>{lastLogType}</span>
        <span id={elementIds.renderCount}>{renderCount}</span>
        <span id={elementIds.nextAction}>{next ? next.type : ''}</span>
        <span id={elementIds.activeAction}>{active ? active.type : ''}</span>
        <span id={elementIds.queueDump}>
          {JSON.stringify(getQueueRunner().getQueue())}
        </span>
        <button
          id={elementIds.startButton}
          onClick={() => {
            getQueueRunner().start();
          }}
        >
          Start
        </button>
        <button
          id={elementIds.reRenderButton}
          onClick={() => {
            forceRender();
          }}
        >
          Render
        </button>
        <button
          id={elementIds.resumeButton}
          onClick={() => {
            if (next) {
              getQueueRunner().resume(next.type);
            }
          }}
        >
          Resume
        </button>
        <button
          id={elementIds.resetButton}
          onClick={() => {
            if (next) {
              reset();
            }
          }}
        >
          Reset
        </button>
      </div>
    );
  };
  const UnmountingHookWrapper = (props: TestComponentProps = {}) => {
    const [shouldRender, updateShouldRender] = useState(true);
    const toggleComponent = () => {
      updateShouldRender(bool => !bool);
    };
    return (
      <div>
        {shouldRender && <TestUseActionQueueHook {...props} />}
        <button
          id={elementIds.unmountButton}
          onClick={() => {
            toggleComponent();
          }}
        >
          Start
        </button>
      </div>
    );
  };
  const renderTestComponent = (props?: TestComponentProps) => {
    const result = render(<UnmountingHookWrapper {...props} />);
    const { container } = result;

    const getElementById = (id: string) =>
      container.querySelector(`#${id}`) as HTMLElement;

    const getRenderCount = () =>
      parseInt(getElementById(elementIds.renderCount).innerHTML, 10);

    const getLastActionType = () =>
      getElementById(elementIds.lastActionType).innerHTML || undefined;

    const getLastLogType = () =>
      getElementById(elementIds.lastLogType).innerHTML || undefined;

    const getIsComplete = () =>
      getElementById(elementIds.isComplete).innerHTML === 'true';

    const getHasError = () =>
      getElementById(elementIds.hasError).innerHTML === 'true';

    const getIsActive = () =>
      getElementById(elementIds.isActive).innerHTML === 'true';

    const getActiveActionType = () =>
      getElementById(elementIds.activeAction).innerHTML || undefined;

    const getNextActionType = () =>
      getElementById(elementIds.nextAction).innerHTML || undefined;

    const getQueue = () =>
      JSON.parse(getElementById(elementIds.queueDump).innerHTML);

    const start = () => {
      const button = getElementById(elementIds.startButton);
      fireEvent.click(button);
    };

    const resume = () => {
      const button = getElementById(elementIds.resumeButton);
      fireEvent.click(button);
    };

    const reset = () => {
      const button = getElementById(elementIds.resetButton);
      fireEvent.click(button);
    };

    const rerender = async () => {
      const startCount = getRenderCount();
      const button = getElementById(elementIds.reRenderButton);
      fireEvent.click(button);
      return waitFor(() => {
        if (getRenderCount() === startCount) {
          throw new Error('Not updated');
        }
      });
    };

    const getState = () => ({
      lastLogType: getLastLogType(),
      hasError: getHasError(),
      isActive: getIsActive(),
      isComplete: getIsComplete(),
      lastActionType: getLastActionType(),
    });

    const toggleComponentMounting = async () => {
      const getIsMounted = () => !!getElementById(elementIds.reRenderButton);
      const isMounted = getIsMounted();
      const button = getElementById(elementIds.unmountButton);
      fireEvent.click(button);
      return waitFor(() => {
        if (getIsMounted() === isMounted) {
          throw new Error('Not changed');
        }
      });
    };

    return {
      getRenderCount,
      getLastActionType,
      getLastLogType,
      getIsComplete,
      getHasError,
      getIsActive,
      start,
      rerender,
      getState,
      toggleComponentMounting,
      getActiveActionType,
      getNextActionType,
      getQueue,
      resume,
      reset,
    };
  };

  const initialQueueState: QueueState = {
    lastActionType: undefined,
    hasError: false,
    lastLogType: undefined,
    isActive: false,
    isComplete: false,
  };

  const getActionStartedState = (props: Partial<Action>): QueueState => ({
    ...initialQueueState,
    lastActionType: props.type,
    lastLogType: 'started',
    isActive: true,
  });
  const getActionCompleteState = (props: Partial<Action>): QueueState => ({
    ...initialQueueState,
    lastActionType: props.type,
    lastLogType: !props.errorMessage ? 'completed' : 'error',
    isActive: false,
    isComplete: true,
    hasError: !!props.errorMessage,
  });

  const queueStorageKey = 'test-key';

  afterEach(async () => {
    cleanMockData();
    vi.restoreAllMocks();
  });

  it('Actions are executed and state changes while queue is processed ', async () => {
    const { start, getState } = renderTestComponent();
    expect(getState()).toMatchObject(initialQueueState);
    start();

    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingActionSource1.type })
      );
    });
    completeActionExecutor(resolvingActionSource1.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingActionSource2.type })
      );
    });

    completeActionExecutor(resolvingActionSource2.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionCompleteState({ type: resolvingActionSource2.type })
      );
    });
  });
  it('Failing queue changes state accordingly ', async () => {
    const { start, getState } = renderTestComponent({ fail: true });
    start();

    completeActionExecutor(resolvingActionSource1.type);
    await waitFor(() => {
      expect(isActionTriggered(rejectingActionSource.type)).toBeTruthy();
    });
    completeActionExecutor(rejectingActionSource.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionCompleteState({
          type: rejectingActionSource.type,
          errorMessage: (rejectingActionSource.rejectValue as Error).message,
        })
      );
    });
  });
  it('Re-rendering does not affect the hook or queue ', async () => {
    const { start, getState, rerender } = renderTestComponent();
    start();

    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingActionSource1.type })
      );
    });
    await rerender();
    await rerender();
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingActionSource1.type })
      );
    });
    await rerender();
    await rerender();
    completeActionExecutor(resolvingActionSource1.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingActionSource2.type })
      );
    });
    completeActionExecutor(resolvingActionSource2.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionCompleteState({ type: resolvingActionSource2.type })
      );
    });
  });
  it('Unmounting stops the queue and when mounting again, the queue is in its initial state.', async () => {
    const {
      start,
      getState,
      toggleComponentMounting,
      rerender,
    } = renderTestComponent();
    start();

    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingActionSource1.type })
      );
    });
    await toggleComponentMounting();
    // completing an action after queue is cleared has no effect.
    completeActionExecutor(resolvingActionSource1.type);
    await toggleComponentMounting();
    await rerender();
    await waitFor(() => {
      expect(getState()).toMatchObject(initialQueueState);
    });
  });
  it('Merges the queue from storage when a storageKey is passed.', async () => {
    const queueInStorage = createQueueFromProps(getSuccessfulQueueWithResult());
    queueInStorage[0].complete = true;
    queueInStorage[0].result = '100';
    queueInStorage[1].complete = true;
    queueInStorage[1].errorMessage = 'error';
    storeQueue(queueStorageKey, queueInStorage);
    const { getNextActionType, getQueue } = renderTestComponent({
      storageKey: queueStorageKey,
    });
    expect(getQueue()).toMatchObject([
      pickUpdateActionProps(queueInStorage[0]),
      pickUpdateActionProps(queueInStorage[1]),
    ]);
    expect(getNextActionType()).toBeUndefined();
  });
  it('Discards stored queue if it is older than 2 minutes.', async () => {
    const queueInComponent = createQueueFromProps(
      getSuccessfulQueueWithResult()
    );
    const queueInStorage = cloneArray(queueInComponent);
    queueInStorage[0].updatedAt = Date.now() - 60 * 1000 * 2 - 1;
    queueInStorage[0].result = 'this should not be set';
    storeQueue(queueStorageKey, queueInStorage);
    const { getQueue } = renderTestComponent({
      storageKey: queueStorageKey,
    });
    expect(getQueue()).toMatchObject([
      pickUpdateActionProps(queueInComponent[0], true, false, true),
      pickUpdateActionProps(queueInComponent[1], true, false, true),
    ]);
  });
  it('Action.active are set to "false" even if stored value is "true" ', async () => {
    const queueInStorage = createQueueFromProps(getSuccessfulQueueWithResult());
    queueInStorage[0].active = true;
    queueInStorage[1].active = true;
    storeQueue(queueStorageKey, queueInStorage);
    const { getQueue } = renderTestComponent({
      storageKey: queueStorageKey,
    });
    expect(getQueue()).toMatchObject([
      {
        active: false,
      },
      {
        active: false,
      },
    ]);
  });
  it('Storage updates while queue is executing ', async () => {
    const { start, getState, getQueue } = renderTestComponent({
      storageKey: queueStorageKey,
      fail: true,
    });
    expect(getState()).toMatchObject(initialQueueState);
    start();

    await waitFor(() => {
      const storedQueue = getStoredQueue(queueStorageKey) as ActionQueue;
      expect(storedQueue).toMatchObject(getQueue());
      expect(storedQueue[0].active).toBeTruthy();
    });
    completeActionExecutor(resolvingActionSource1.type);
    await waitFor(() => {
      const storedQueue = getStoredQueue(queueStorageKey) as ActionQueue;
      expect(getStoredQueue(queueStorageKey)).toMatchObject(getQueue());
      expect(storedQueue[0]).toMatchObject({
        complete: true,
        active: false,
        result: resolvingActionSource1.resolveValue,
      });
    });
    await waitFor(() => {
      const storedQueue = getStoredQueue(queueStorageKey) as ActionQueue;
      expect(storedQueue[1].active).toBeTruthy();
    });

    completeActionExecutor(rejectingActionSource.type);
    await waitFor(() => {
      const storedQueue = getStoredQueue(queueStorageKey) as ActionQueue;
      expect(getStoredQueue(queueStorageKey)).toMatchObject(getQueue());
      expect(storedQueue[1]).toMatchObject({
        complete: true,
        active: false,
        errorMessage: (rejectingActionSource.rejectValue as Error).message,
      });
    });
  });
  it('Does not merge stored queue if actions do not match', async () => {
    const queue = getSuccessfulQueueWithResult();
    const queueInStorage = createQueueFromProps([queue[1], queue[0]]);
    queueInStorage[0].complete = true;
    queueInStorage[0].result = '100';
    queueInStorage[1].complete = true;
    queueInStorage[1].errorMessage = 'error';
    storeQueue(queueStorageKey, queueInStorage);
    const { getNextActionType, getQueue } = renderTestComponent({
      storageKey: queueStorageKey,
    });
    expect(getQueue()).toMatchObject([
      {
        active: false,
        complete: false,
        type: resolvingActionSource1.type,
      },
      {
        active: false,
        complete: false,
        type: resolvingActionSource2.type,
      },
    ]);
    expect(getNextActionType()).toBe(resolvingActionSource1.type);
  });
  it('Initial state reflects merged queues', async () => {
    const queueInStorage = createQueueFromProps(getSuccessfulQueueWithResult());
    queueInStorage[0].complete = true;
    queueInStorage[1].complete = true;
    queueInStorage[1].errorMessage = 'error';
    storeQueue(queueStorageKey, queueInStorage);
    const { getState } = renderTestComponent({
      storageKey: queueStorageKey,
    });
    expect(getState()).toMatchObject({
      isComplete: true,
      isActive: false,
      hasError: true,
      lastActionType: undefined,
      lastLogType: undefined,
    });
  });
  it('Resetting changes state accordingly ', async () => {
    const { start, getState, reset, getIsComplete } = renderTestComponent({
      fail: true,
    });
    start();
    completeActionExecutor(resolvingActionSource1.type);
    await waitFor(() => {
      expect(isActionTriggered(rejectingActionSource.type)).toBeTruthy();
    });
    completeActionExecutor(rejectingActionSource.type);
    await waitFor(() => {
      expect(getIsComplete()).toBeTruthy();
    });
    reset();
    await waitFor(() => {
      expect(getState()).toMatchObject({
        isComplete: false,
        isActive: false,
        hasError: false,
        lastActionType: undefined,
        lastLogType: 'reset',
      });
    });
  });
});
