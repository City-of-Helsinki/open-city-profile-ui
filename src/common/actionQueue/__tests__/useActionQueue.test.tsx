import React, { useMemo, useState } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { QueueState, useActionQueue } from '../useActionQueue';
import {
  ActionSourceForTesting,
  createManuallyTriggerableExecutor,
  rejectingAction,
  resolvingAction1,
  resolvingAction2,
} from '../test.util';
import { Action, ActionType } from '../actionQueue';

type TestComponentProps = { fail?: boolean };

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
  };

  const triggers = new Map<ActionType, () => void>();
  const completeActionExecutor = (type: ActionType) => {
    const trigger = triggers.get(type);
    if (!trigger) {
      throw new Error(`Unknown type ${type}`);
    }
    trigger();
  };

  const createActionProps = (props: ActionSourceForTesting) => {
    const { trigger, executor } = createManuallyTriggerableExecutor(props);
    triggers.set(props.type, trigger);
    return {
      type: props.type,
      executor,
    };
  };

  const getSuccessfulQueue = () => [
    {
      ...createActionProps(resolvingAction1),
    },
    {
      ...createActionProps(resolvingAction2),
    },
  ];

  const getFailingQueue = () => [
    {
      ...createActionProps(resolvingAction1),
    },
    {
      ...createActionProps(rejectingAction),
    },
    {
      ...createActionProps(resolvingAction2),
    },
  ];

  const TestUseActionQueueHook = (props: TestComponentProps = {}) => {
    const { fail } = props;
    const queue = useMemo(
      () => (fail ? getFailingQueue() : getSuccessfulQueue()),
      [fail]
    );
    const [renderCount, rerender] = useState(0);
    const forceRender = () => {
      rerender(n => n + 1);
    };
    const { state, getQueueRunner } = useActionQueue(queue);
    const {
      lastActionType,
      isComplete,
      lastLogType,
      hasError,
      isActive,
    } = state;
    return (
      <div>
        <span id={elementIds.lastActionType}>{lastActionType}</span>
        <span id={elementIds.isComplete}>{String(isComplete)}</span>
        <span id={elementIds.hasError}>{String(hasError)}</span>
        <span id={elementIds.isActive}>{String(isActive)}</span>
        <span id={elementIds.lastLogType}>{lastLogType}</span>
        <span id={elementIds.renderCount}>{renderCount}</span>
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

    const start = () => {
      const button = getElementById(elementIds.startButton);
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

  afterEach(async () => {
    jest.restoreAllMocks();
    triggers.forEach(value => {
      value();
    });
    await Promise.resolve();
  });

  it('Actions are executed and state changes while queue is processed ', async () => {
    const { start, getState } = renderTestComponent();
    expect(getState()).toMatchObject(initialQueueState);
    start();

    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingAction1.type })
      );
    });
    completeActionExecutor(resolvingAction1.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingAction2.type })
      );
    });

    completeActionExecutor(resolvingAction2.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionCompleteState({ type: resolvingAction2.type })
      );
    });
  });
  it('Failing queue changes state accordingly ', async () => {
    const { start, getState } = renderTestComponent({ fail: true });
    start();

    completeActionExecutor(resolvingAction1.type);
    completeActionExecutor(rejectingAction.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionCompleteState({
          type: rejectingAction.type,
          errorMessage: (rejectingAction.rejectValue as Error).message,
        })
      );
    });
  });
  it('Re-rendering does not affect the hook or queue ', async () => {
    const { start, getState, rerender } = renderTestComponent();
    start();

    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingAction1.type })
      );
    });
    await rerender();
    await rerender();
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingAction1.type })
      );
    });
    await rerender();
    await rerender();
    completeActionExecutor(resolvingAction1.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionStartedState({ type: resolvingAction2.type })
      );
    });
    completeActionExecutor(resolvingAction2.type);
    await waitFor(() => {
      expect(getState()).toMatchObject(
        getActionCompleteState({ type: resolvingAction2.type })
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
        getActionStartedState({ type: resolvingAction1.type })
      );
    });
    await toggleComponentMounting();
    // completing an action after queue is cleared has no effect.
    completeActionExecutor(resolvingAction1.type);
    await toggleComponentMounting();
    await rerender();
    await waitFor(() => {
      expect(getState()).toMatchObject(initialQueueState);
    });
  });
});
