import MatomoTracker from './MatomoTracker';

export type MatomoTrackerInstance = {
  trackEvent: MatomoTracker['trackEvent'];
  trackPageView: MatomoTracker['trackPageView'];
};
