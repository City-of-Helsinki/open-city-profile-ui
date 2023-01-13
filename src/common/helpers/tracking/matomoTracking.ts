import { createInstance } from '@datapunt/matomo-tracker-react';
import { useMemo } from 'react';

import { trackingCookieId } from '../../../cookieConsents/cookieContentSource';

type TrackingEvent = string[];
type Tracker = { push: (event: TrackingEvent) => void };

const disableEvents = ['requireCookieConsent', 'requireConsent'];
const enableEvents = ['rememberCookieConsentGiven', 'rememberConsentGiven'];
const forgetEvents = ['forgetCookieConsentGiven', 'forgetConsentGiven'];

function getTrackingObject(): Tracker {
  if (!window._paq) {
    window._paq = [];
  }
  return (window._paq as unknown) as Tracker;
}

function pushEvent(events: TrackingEvent): void {
  const tracker = getTrackingObject();
  events.forEach(event => {
    tracker.push([event]);
  });
}

export function disableTrackingCookiesUntilConsentGiven() {
  pushEvent(disableEvents);
}

export function enableTrackingCookies() {
  // never enable tracking in non-prod
  if (window._env_.REACT_APP_ENVIRONMENT !== 'production') {
    return;
  }
  pushEvent(enableEvents);
}

export function disableTrackingCookies() {
  pushEvent(forgetEvents);
}

// At the moment all tracking is disabled / enabled at the same time.
// Tracking with cookies and without cookies are bundled in to one tracking type.
// That's why only single cookie consent is checked here.
export function areTrackingCookiesEnabled(
  cookies: Record<string, boolean>
): boolean {
  return cookies[trackingCookieId] === true;
}

export function handleCookieConsentChange(
  cookies: Record<string, boolean>
): void {
  if (areTrackingCookiesEnabled(cookies)) {
    enableTrackingCookies();
  } else {
    disableTrackingCookies();
  }
}

export function useTrackingInstance(): ReturnType<typeof createInstance> {
  return useMemo(() => {
    // matomo.js is not loaded, if window._paq.length > 0
    // so clearing it before creating the instance.
    // events are pushed back below
    const existingTrackingEvents = Array.isArray(window._paq)
      ? [...window._paq]
      : [];

    const hadExistingEvents = existingTrackingEvents.length;
    if (hadExistingEvents) {
      window._paq.length = 0;
    }

    const matomo = createInstance({
      urlBase: 'https://analytics.hel.ninja/',
      siteId: 60,
    });

    if (hadExistingEvents) {
      existingTrackingEvents.forEach(pushEvent);
    }

    return matomo;
  }, []);
}
