import { useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Location } from 'history';

type TrackingResult = {
  hasInternalPageLoads: boolean;
};

type RedirectState = {
  state: {
    isRedirect: boolean;
  };
};

let historyTracker: Location[] | null = null;

export function checkForInternalPageLoads(events: Location[] | null): boolean {
  if (!events) {
    return true;
  }
  if (events.length === 0) {
    return false;
  }
  const nonRedirectsInHistory = events.filter(
    location => !location.state || !(location as RedirectState).state.isRedirect
  );
  return nonRedirectsInHistory.length > 0;
}

export function useHistoryListener(): void {
  const history = useHistory();
  const historyListenerRef = useRef<() => void>();
  historyListenerRef.current = useMemo(() => {
    historyTracker = [];
    return history.listen(e => {
      if (!historyTracker) {
        return;
      }
      historyTracker.push(e);
      if (
        historyListenerRef.current &&
        checkForInternalPageLoads(historyTracker)
      ) {
        historyListenerRef.current();
        historyListenerRef.current = undefined;
        historyTracker = null;
      }
    });
  }, [history]);
}

export function useHistoryTracker(): TrackingResult {
  return {
    hasInternalPageLoads: checkForInternalPageLoads(historyTracker),
  };
}

export function getLinkRedirectState(): RedirectState['state'] {
  return {
    isRedirect: true,
  };
}
