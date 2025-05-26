import { useCallback, useContext } from 'react';

import MatomoContext from '../matomo-context';
import { TrackEventParams, TrackPageViewParams } from '../MatomoTracker';
import { MatomoTrackerInstance } from '../types';

function useMatomo(): MatomoTrackerInstance {
  const instance = useContext(MatomoContext);

  const trackPageView = useCallback((params?: TrackPageViewParams) => instance?.trackPageView(params), [instance]);

  const trackEvent = useCallback((params: TrackEventParams) => instance?.trackEvent(params), [instance]);

  return { trackPageView, trackEvent };
}

export default useMatomo;
