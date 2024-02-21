import React, { useState } from 'react';
import { act, render, waitFor, cleanup } from '@testing-library/react';
import { Location } from 'history';

import { createDomHelpersWithTesting } from '../../../common/test/testingLibraryTools';
import {
  checkForInternalPageLoads,
  getLinkRedirectState,
  useHistoryListener,
  useHistoryTracker,
} from '../useHistoryListener';

type HistoryListener = (e: Location) => void;
type DomHelpers = ReturnType<typeof createDomHelpersWithTesting>;

const stopListeningMock = vi.fn();
const startListeningMock = vi.fn();
const mockHistory = {
  listeners: new Set<HistoryListener>(),
  listen(listener: HistoryListener) {
    this.listeners.add(listener);
    startListeningMock();
    return () => {
      stopListeningMock();
      this.listeners.delete(listener);
    };
  },
};

const triggerHistoryEvent = (e: Location) => {
  mockHistory.listeners.forEach(f => f(e));
};

const createLocationWithRedirectState = () =>
  ({ state: getLinkRedirectState() } as Location);

const resetMockHistory = () => {
  mockHistory.listeners = new Set();
  stopListeningMock.mockClear();
  startListeningMock.mockClear();
};

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    useHistory: vi.fn().mockImplementation(() => mockHistory),
  };
});

describe('useHistoryListener.ts ', () => {
  describe('helper function checkForInternalPageLoads', () => {
    it('Returns true when there are non-redirect events in history tracker.', () => {
      expect(
        checkForInternalPageLoads([
          {} as Location,
          createLocationWithRedirectState(),
        ])
      ).toBeTruthy();
      expect(
        checkForInternalPageLoads([
          createLocationWithRedirectState(),
          {} as Location,
        ])
      ).toBeTruthy();
    });
    it('Returns false when there are no non-redirect events in history tracker.', () => {
      expect(checkForInternalPageLoads([])).toBeFalsy();
      expect(
        checkForInternalPageLoads([
          createLocationWithRedirectState(),
          createLocationWithRedirectState(),
        ])
      ).toBeFalsy();
    });
  });
  describe('Hooks', () => {
    let appForceRender: () => void | undefined = () => undefined;

    const selectors = {
      appRenderCountId: 'app-render-count',
      hasInternalPageLoadsId: 'has-internal-page-loads',
    };

    const getAppRenderCount = async (helpers: DomHelpers) => {
      const el = await helpers.findById(selectors.appRenderCountId);
      return parseInt((el as HTMLElement).innerHTML, 10);
    };

    const getHasInternalPageLoads = async (helpers: DomHelpers) => {
      const el = await helpers.findById(selectors.hasInternalPageLoadsId);
      return (el as HTMLElement).innerHTML === 'true';
    };

    const TestChild = () => {
      const trackingResult = useHistoryTracker();
      return (
        <div>
          <span id={selectors.hasInternalPageLoadsId}>
            {String(trackingResult.hasInternalPageLoads)}
          </span>
        </div>
      );
    };

    const TestApp = () => {
      useHistoryListener();
      const [renderCount, renderApp] = useState<number>(0);
      appForceRender = () => {
        renderApp(n => n + 1);
      };
      return (
        <div>
          <TestChild />
          <span id={selectors.appRenderCountId}>{renderCount}</span>
        </div>
      );
    };

    const renderAndReturnHelpers = () =>
      createDomHelpersWithTesting(render(<TestApp />));

    afterEach(() => {
      resetMockHistory();
      cleanup();
    });

    describe('useHistoryListener', () => {
      it('Starts to listen history once and only once', async () => {
        await act(async () => {
          const helpers = renderAndReturnHelpers();
          const appRenderCount = await getAppRenderCount(helpers);
          expect(startListeningMock).toHaveBeenCalledTimes(1);
          await waitFor(async () => {
            appForceRender();
            const count = await getAppRenderCount(helpers);
            if (count === appRenderCount) {
              throw new Error('App not re-rendered');
            }
          });
          expect(startListeningMock).toHaveBeenCalledTimes(1);
        });
      });

      it('Stops listening to history when internal page load is detected', async () => {
        await act(async () => {
          renderAndReturnHelpers();

          // redirects are not internal page loads
          triggerHistoryEvent(createLocationWithRedirectState());
          appForceRender();
          expect(startListeningMock).toHaveBeenCalledTimes(1);
          expect(stopListeningMock).toHaveBeenCalledTimes(0);

          triggerHistoryEvent({} as Location);
          appForceRender();
          expect(startListeningMock).toHaveBeenCalledTimes(1);
          expect(stopListeningMock).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('useHistoryTracker returns an object with hasInternalPageLoads ', () => {
      it('which is false until a internal page load is detected', async () => {
        await act(async () => {
          const helpers = renderAndReturnHelpers();
          const value = await getHasInternalPageLoads(helpers);
          let newValue;
          triggerHistoryEvent(createLocationWithRedirectState());
          appForceRender();
          expect(value).toBeFalsy();

          triggerHistoryEvent({} as Location);
          await waitFor(async () => {
            appForceRender();
            newValue = await getHasInternalPageLoads(helpers);
            if (newValue === value) {
              throw new Error('hasInternalPageLoads not changed');
            }
          });
          expect(newValue).toBeTruthy();
        });
      });
    });
  });
});
