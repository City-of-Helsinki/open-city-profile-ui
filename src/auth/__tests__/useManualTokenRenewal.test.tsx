import React, { useState } from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { noop } from 'lodash';

import authService from '../authService';
import useManualTokenRenewal from '../useManualTokenRenewal';

type ReturnType = {
  getWarning: () => boolean;
  getRenderCount: () => number;
  getCancelButton: () => HTMLButtonElement;
  getHideButton: () => HTMLButtonElement;
  getReRenderButton: () => HTMLButtonElement;
  getEmptyButton: () => HTMLButtonElement;
  getHookElement: () => HTMLDivElement;
  getHideIndicatorElement: () => HTMLDivElement;
};

const mockSpies = {
  renewToken: jest.fn(),
  addAccessTokenExpiring: jest.fn(),
  removeAccessTokenExpiring: jest.fn(),
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
  waitForAuthentication: jest.fn(),
};

let mockIsAuthenticated = false;
let mockWaitForAuthenticationResolver = noop;

jest.mock('../authService', () => ({
  renewToken: () => {
    mockSpies.renewToken();
    return new Promise(resolve => {
      setTimeout(() => resolve({}), 50);
    });
  },
  isAuthenticated: () => {
    mockSpies.isAuthenticated();
    return mockIsAuthenticated;
  },
  logout: () => {
    mockSpies.logout();
  },
  userManager: {
    events: {
      addAccessTokenExpiring: (cb: jest.Mock) => {
        mockSpies.addAccessTokenExpiring(cb);
      },
      removeAccessTokenExpiring: (cb: jest.Mock) => {
        mockSpies.removeAccessTokenExpiring(cb);
      },
    },
  },
  waitForAuthentication: (callback: unknown) => {
    mockSpies.waitForAuthentication(callback);
    if (mockIsAuthenticated) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      mockWaitForAuthenticationResolver = resolve;
    });
  },
}));

describe('useManualTokenRenewal', () => {
  const warnIndicatorElementId = 'warn-indicator';
  const cancelButtonElementId = 'cancel-button';
  const hideButtonElementId = 'hide-button';
  const reRenderButtonElementId = 're-render-button';
  const renderCountIndicatorElementId = 'render-count-indicator';
  const hookElementId = 'hook-element';
  const hiddenElementId = 'hidden';
  const emptyButtonElementId = 'hidden';

  const logoutThreshold = 1000 * 60 * 10;
  const warningThreshold = 1000 * 60 * 8;
  const checkInterval = 1000 * 60;

  const HookComponent = () => {
    const { warn, cancelTimeout } = useManualTokenRenewal({ authService });
    return (
      <div id={hookElementId}>
        <span id={warnIndicatorElementId}>{String(warn)}</span>
        <button id={cancelButtonElementId} onClick={cancelTimeout}>
          cancelTimeout
        </button>
        <button id={emptyButtonElementId} onClick={jest.fn()}>
          Just a click target
        </button>
      </div>
    );
  };

  const TestComponent = () => {
    const [isHidden, updateIsHidden] = useState(false);
    const [renderCount, forceRender] = useState(0);
    return (
      <div>
        {!isHidden && <HookComponent />}
        {isHidden && <div id={hiddenElementId}>hidden</div>}
        <button
          id={hideButtonElementId}
          onClick={() => updateIsHidden(!isHidden)}
        >
          cancelTimeout
        </button>
        <button
          id={reRenderButtonElementId}
          onClick={() => forceRender(count => count + 1)}
        >
          re-render
        </button>
        <span id={renderCountIndicatorElementId}>{String(renderCount)}</span>
      </div>
    );
  };

  const renderTestComponent = (data?: {
    isAuthenticated: boolean;
  }): ReturnType => {
    mockIsAuthenticated = data?.isAuthenticated === true;
    const result = render(<TestComponent />);
    const { container } = result;
    const getElementById = (id: string) =>
      container.querySelector(`#${id}`) as HTMLElement;
    return {
      getWarning: () =>
        getElementById(warnIndicatorElementId).innerHTML === 'true',
      getCancelButton: () =>
        getElementById(cancelButtonElementId) as HTMLButtonElement,
      getHideButton: () =>
        getElementById(hideButtonElementId) as HTMLButtonElement,
      getHookElement: () => getElementById(hookElementId) as HTMLDivElement,
      getHideIndicatorElement: () =>
        getElementById(hiddenElementId) as HTMLDivElement,
      getReRenderButton: () =>
        getElementById(reRenderButtonElementId) as HTMLButtonElement,
      getRenderCount: () =>
        parseInt(getElementById(renderCountIndicatorElementId).innerHTML, 10),
      getEmptyButton: () =>
        getElementById(emptyButtonElementId) as HTMLButtonElement,
    };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
    jest.spyOn(global.document, 'addEventListener');
    jest.spyOn(global.document, 'removeEventListener');
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    mockIsAuthenticated = false;
    mockWaitForAuthenticationResolver = noop;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // jest might add its own listeners, so filter those out
  const getExpectedListenerMockCalls = (fn: unknown) =>
    (fn as jest.Mock).mock.calls.filter(call => {
      const [type, func] = call;
      return (
        ['pointerup', 'keyup'].includes(type) && typeof func === 'function'
      );
    });

  const getAddEventListenerCalls = () =>
    getExpectedListenerMockCalls(global.document.addEventListener);

  const getRemoveEventListenerCalls = () =>
    getExpectedListenerMockCalls(global.document.removeEventListener);

  const getAccessTokenExpiringCallback = () => {
    const calls = mockSpies.addAccessTokenExpiring.mock.calls;
    if (calls.length !== 1) {
      throw new Error('addAccessTokenExpiring not called correct times!');
    }
    return calls[0][0];
  };

  const advanceTimersToBeyondWarningThreshold = () =>
    jest.advanceTimersByTime(warningThreshold + 100);

  const advanceTimersOneCheckInterval = () =>
    jest.advanceTimersByTime(checkInterval + 100);

  const advanceTimersToBeyondLogoutThreshold = () =>
    jest.advanceTimersByTime(logoutThreshold + 100);

  const advanceTimersToNearWarningThreshold = () =>
    jest.advanceTimersByTime(warningThreshold - 100);

  const removeComponent = async (result: ReturnType) => {
    await act(async () => {
      const { getHideButton, getHideIndicatorElement, getHookElement } = result;
      expect(!!getHookElement()).toBeTruthy();
      getHideButton().click();
      await waitFor(() => {
        expect(!!getHideIndicatorElement()).toBeTruthy();
        expect(!!getHookElement()).toBeFalsy();
      });
    });
  };
  const rerender = async (result: ReturnType) =>
    act(async () => {
      const { getReRenderButton, getRenderCount } = result;
      const initialCount = getRenderCount();
      getReRenderButton().click();
      await waitFor(() => {
        expect(getRenderCount()).toBe(initialCount + 1);
      });
    });

  it('When user is not authenticated, no timers are started or listeners added.', async () => {
    const result = renderTestComponent();
    const { getWarning } = result;
    expect(getWarning()).toBeFalsy();
    expect(mockSpies.waitForAuthentication).toHaveBeenCalledTimes(1);
    await rerender(result);
    expect(global.setInterval).toHaveBeenCalledTimes(0);
    expect(getAddEventListenerCalls()).toHaveLength(0);
    expect(mockSpies.addAccessTokenExpiring).toHaveBeenCalledTimes(0);
    expect(mockSpies.renewToken).toHaveBeenCalledTimes(0);
  });

  it('When user is authenticated, timers are started and listeners added. Only once!', async () => {
    const result = renderTestComponent({ isAuthenticated: true });
    expect(mockSpies.waitForAuthentication).toHaveBeenCalledTimes(1);
    await rerender(result);
    await rerender(result);
    expect(global.setInterval).toHaveBeenCalledTimes(1);
    // one pointer and one key event on each initialization
    expect(getAddEventListenerCalls()).toHaveLength(2);
    expect(mockSpies.addAccessTokenExpiring).toHaveBeenCalledTimes(1);
    expect(mockSpies.renewToken).toHaveBeenCalledTimes(0);
  });
  it('User might not be authenticated immediately - for example when returning from login', async () => {
    const result = renderTestComponent({ isAuthenticated: false });
    expect(mockSpies.waitForAuthentication).toHaveBeenCalledTimes(1);
    await rerender(result);
    expect(global.setInterval).toHaveBeenCalledTimes(0);
    expect(getAddEventListenerCalls()).toHaveLength(0);
    mockWaitForAuthenticationResolver();
    await rerender(result);
    await waitFor(() => {
      expect(global.setInterval).toHaveBeenCalledTimes(1);
      expect(getAddEventListenerCalls()).toHaveLength(2);
    });
  });

  it('Timers and listeners are removed when component is removed.', async () => {
    const result = renderTestComponent({ isAuthenticated: true });
    await rerender(result);
    await rerender(result);
    await rerender(result);
    // event listeners are deleted when new ones are added
    expect(getRemoveEventListenerCalls()).toHaveLength(2);
    expect(getAddEventListenerCalls()).toHaveLength(2);
    await removeComponent(result);
    expect(global.setInterval).toHaveBeenCalledTimes(1);
    expect(global.clearInterval).toHaveBeenCalledTimes(1);
    expect(mockSpies.addAccessTokenExpiring).toHaveBeenCalledTimes(1);
    expect(mockSpies.removeAccessTokenExpiring).toHaveBeenCalledTimes(1);
    // event listeners are deleted also when component is unloaded
    expect(getRemoveEventListenerCalls()).toHaveLength(4);
    expect(mockSpies.renewToken).toHaveBeenCalledTimes(0);
  });

  it('Warning is triggered when user is idle long enough. Calling cancelTimeout() resets the warning ', async () => {
    const result = renderTestComponent({ isAuthenticated: true });
    const { getWarning, getCancelButton } = result;
    expect(getWarning()).toBeFalsy();
    advanceTimersToBeyondWarningThreshold();
    await waitFor(
      async () => {
        await rerender(result);
        expect(getWarning()).toBeTruthy();
      },
      { timeout: warningThreshold * 2 }
    );
    getCancelButton().click();
    await waitFor(() => {
      expect(getWarning()).toBeFalsy();
    });
    await rerender(result);
    await waitFor(
      () => {
        advanceTimersOneCheckInterval();
        expect(getWarning()).toBeTruthy();
      },
      { timeout: warningThreshold * 2 }
    );
    // warning does not end timers
    expect(global.clearInterval).toHaveBeenCalledTimes(0);
  });
  it('Warning is not triggered while user is active and event listener is triggered.', async () => {
    const result = renderTestComponent({ isAuthenticated: true });
    const { getWarning } = result;

    await act(async () => {
      advanceTimersToNearWarningThreshold();
      const event = new KeyboardEvent('keyup', {
        keyCode: 37,
        bubbles: true,
      });
      global.document.dispatchEvent(event);
      advanceTimersOneCheckInterval();
      await rerender(result);
      expect(getWarning()).toBeFalsy();
    });
  });
  it(`Token is not renewed if it is expiring but user has been idle. 
      It is renewed when user is active again`, async () => {
    const result = renderTestComponent({ isAuthenticated: true });
    const { getWarning, getCancelButton } = result;
    advanceTimersToBeyondWarningThreshold();
    await waitFor(
      () => {
        expect(getWarning()).toBeTruthy();
      },
      { timeout: warningThreshold * 2 }
    );
    const accessTokenExpiringCallback = getAccessTokenExpiringCallback();
    accessTokenExpiringCallback();
    expect(mockSpies.renewToken).toHaveBeenCalledTimes(0);
    getCancelButton().click();
    advanceTimersOneCheckInterval();
    await waitFor(() => {
      expect(getWarning()).toBeFalsy();
      expect(mockSpies.renewToken).toHaveBeenCalledTimes(1);
    });
  });
  it('When user is idle long enough, the user is logged out.', async () => {
    const result = renderTestComponent({ isAuthenticated: true });
    const { getWarning } = result;
    advanceTimersToBeyondWarningThreshold();
    await waitFor(
      async () => {
        await rerender(result);
        expect(getWarning()).toBeTruthy();
      },
      { timeout: warningThreshold * 2 }
    );

    await rerender(result);
    advanceTimersToBeyondLogoutThreshold();
    // logut is called
    await waitFor(
      async () => {
        expect(mockSpies.logout).toHaveBeenCalledTimes(1);
      },
      { timeout: logoutThreshold * 2 }
    );

    // all timers are stopped
    expect(global.clearInterval).toHaveBeenCalledTimes(1);
    expect(mockSpies.removeAccessTokenExpiring).toHaveBeenCalledTimes(1);
    // event listeners are deleted before new ones are added
    // event listeners are removed before user is logged out
    expect(getRemoveEventListenerCalls()).toHaveLength(4);
  });
});
