/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mock } from 'vitest';

import {
  disableTrackingCookiesUntilConsentGiven,
  enableTrackingCookies,
  waitForConsent,
  disableTrackingCookies,
  areTrackingCookiesEnabled,
  handleOnAllConsentsGiven,
  handleOnConsentsParsed,
  trackingCookieId,
} from '../../../common/helpers/tracking/matomoTracking';

describe('matomoTracking', () => {
  let mockTracker: { push: Mock };

  beforeEach(() => {
    mockTracker = { push: vi.fn() };
    (window as any)._paq = mockTracker;
  });

  afterEach(() => {
    delete (window as any)._paq;
  });

  describe('disableTrackingCookiesUntilConsentGiven', () => {
    it('should push disable events to the tracker', () => {
      disableTrackingCookiesUntilConsentGiven();
      expect(mockTracker.push).toHaveBeenCalledWith(['requireConsent']);
      expect(mockTracker.push).toHaveBeenCalledWith(['requireCookieConsent']);
    });
  });

  describe('enableTrackingCookies', () => {
    it('should push enable events to the tracker in production environment', () => {
      (window as any)._env_ = { REACT_APP_ENVIRONMENT: 'production' };
      enableTrackingCookies();
      expect(mockTracker.push).toHaveBeenCalledWith(['setConsentGiven']);
      expect(mockTracker.push).toHaveBeenCalledWith(['setCookieConsentGiven']);
    });

    it('should not push enable events to the tracker in non-production environment', () => {
      (window as any)._env_ = { REACT_APP_ENVIRONMENT: 'development' };
      enableTrackingCookies();
      expect(mockTracker.push).not.toHaveBeenCalled();
    });
  });

  describe('waitForConsent', () => {
    it('should push disable events to the tracker', () => {
      waitForConsent();
      expect(mockTracker.push).toHaveBeenCalledWith(['requireConsent']);
      expect(mockTracker.push).toHaveBeenCalledWith(['requireCookieConsent']);
    });
  });

  describe('disableTrackingCookies', () => {
    it('should push forget events to the tracker', () => {
      disableTrackingCookies();
      expect(mockTracker.push).toHaveBeenCalledWith(['forgetConsentGiven']);
    });
  });

  describe('areTrackingCookiesEnabled', () => {
    it('should return true if tracking cookie is enabled', () => {
      const cookies = { [trackingCookieId]: true };
      const result = areTrackingCookiesEnabled(cookies);
      expect(result).toBe(true);
    });

    it('should return false if tracking cookie is disabled', () => {
      const cookies = { [trackingCookieId]: false };
      const result = areTrackingCookiesEnabled(cookies);
      expect(result).toBe(false);
    });

    it('should return false if tracking cookie is not present', () => {
      const cookies = {};
      const result = areTrackingCookiesEnabled(cookies);
      expect(result).toBe(false);
    });
  });

  describe('handleOnAllConsentsGiven', () => {
    it('should enable tracking cookies if tracking cookie is present', () => {
      (window as any)._env_ = { REACT_APP_ENVIRONMENT: 'production' };
      const cookies = { [trackingCookieId]: true };
      handleOnAllConsentsGiven(cookies);
      expect(mockTracker.push).toHaveBeenCalledWith(['setConsentGiven']);
      expect(mockTracker.push).toHaveBeenCalledWith(['setCookieConsentGiven']);
    });

    it('should not enable tracking cookies if tracking cookie is not present', () => {
      const cookies = {};
      handleOnAllConsentsGiven(cookies);
      expect(mockTracker.push).not.toHaveBeenCalled();
    });
  });

  describe('handleOnConsentsParsed', () => {
    it('should wait for consent if tracking cookie is not present', () => {
      const cookies = {};
      handleOnConsentsParsed(cookies);
      expect(mockTracker.push).toHaveBeenCalledWith(['requireConsent']);
      expect(mockTracker.push).toHaveBeenCalledWith(['requireCookieConsent']);
    });

    it('should disable tracking cookies if tracking cookie is disabled', () => {
      const cookies = { [trackingCookieId]: false };
      handleOnConsentsParsed(cookies);
      expect(mockTracker.push).toHaveBeenCalledWith(['forgetConsentGiven']);
    });

    it('should not disable tracking cookies if tracking cookie is enabled', () => {
      const cookies = { [trackingCookieId]: true };
      handleOnConsentsParsed(cookies);
      expect(mockTracker.push).not.toHaveBeenCalled();
    });
  });
});
