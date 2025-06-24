type TrackingEvent = string[];
type Tracker = { push: (event: TrackingEvent) => void };

const disableEvents = ['requireConsent', 'requireCookieConsent'];
const enableEvents = ['setConsentGiven', 'setCookieConsentGiven'];
const forgetEvents = ['forgetConsentGiven'];
export const trackingCookieId = 'matomo';

function getTrackingObject(): Tracker {
  if (!window._paq) {
    window._paq = [];
  }
  return window._paq as unknown as Tracker;
}

function pushEvent(events: TrackingEvent): void {
  const tracker = getTrackingObject();
  events.forEach((event) => {
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

export function waitForConsent() {
  pushEvent(disableEvents);
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

export function handleOnAllConsentsGiven(
  cookies: Record<string, boolean>
): void {
  if (cookies[trackingCookieId]) {
    enableTrackingCookies();
  }
}

export function handleOnConsentsParsed(cookies: Record<string, boolean>): void {
  if (cookies[trackingCookieId] === undefined) {
    waitForConsent();
  } else if (!areTrackingCookiesEnabled(cookies)) {
    disableTrackingCookies();
  }
}
