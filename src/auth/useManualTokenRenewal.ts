import { useEffect, useMemo, useRef, useState } from 'react';

import { AuthService } from './authService';

export type ManualTokenRenewalProps = {
  authService: AuthService;
};

export type ManualTokenRenewalReturnType = {
  warn: boolean;
  cancelTimeout: () => void;
};

export type TrackingData = {
  checkIntervalId?: ReturnType<typeof setTimeout>;
  lastUpdate: number;
  idleUserLogoutThresholdInMs: number;
  logoutWarningThresholdInMs: number;
  checkIntervalInMs: number;
  warn: boolean;
  tokenIsExpiring: boolean;
};

export default function useManualTokenRenewal({
  authService,
}: ManualTokenRenewalProps): ManualTokenRenewalReturnType {
  const [, updateState] = useState(0);
  const trackerRef = useRef<TrackingData>({
    lastUpdate: -1,
    checkIntervalId: undefined,
    idleUserLogoutThresholdInMs: 1000 * 60 * 10,
    logoutWarningThresholdInMs: 1000 * 60 * 8,
    checkIntervalInMs: 1000 * 30,
    warn: false,
    tokenIsExpiring: false,
  });

  // single useMemo() is better than wrapping all functions inside it with useCallback(<function>,[dependency array])
  const trackingFunctions = useMemo(() => {
    const forceUpdate = () => {
      updateState(count => count + 1);
    };

    const refreshActivityTime = () => {
      trackerRef.current.lastUpdate = Date.now();
    };

    // change warn value and update state to re-render parent component
    const updateWarnValue = (value: boolean) => {
      if (trackerRef.current.warn === value) {
        return;
      }
      trackerRef.current.warn = value;
      forceUpdate();
    };

    const isTracking = () =>
      !!trackerRef.current.checkIntervalId && !!trackerRef.current.lastUpdate;

    const getActivityStatus = () => {
      if (!isTracking()) {
        return 'stopped';
      }
      const currentRef = trackerRef.current;
      const now = Date.now();
      const timeSinceLastRefresh = now - trackerRef.current.lastUpdate;
      if (timeSinceLastRefresh > currentRef.idleUserLogoutThresholdInMs) {
        return 'expired';
      } else if (timeSinceLastRefresh > currentRef.logoutWarningThresholdInMs) {
        return 'warn';
      }
      return 'ok';
    };

    const renewToken = () => {
      authService.renewToken();
      trackerRef.current.tokenIsExpiring = false;
    };

    const checkActivity = () => {
      const activityLevel = getActivityStatus();
      if (activityLevel === 'expired') {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        stopActivityChecker();
        authService.logout();
      } else if (activityLevel === 'warn') {
        updateWarnValue(true);
      } else if (activityLevel === 'ok' && trackerRef.current.tokenIsExpiring) {
        renewToken();
      }
    };

    const stopTimer = () => {
      if (trackerRef.current.checkIntervalId) {
        clearInterval(trackerRef.current.checkIntervalId);
        trackerRef.current.checkIntervalId = undefined;
      }
      trackerRef.current.lastUpdate = -1;
    };

    const startTimer = () => {
      stopTimer();
      trackerRef.current.checkIntervalId = setInterval(
        checkActivity,
        trackerRef.current.checkIntervalInMs
      );
      refreshActivityTime();
    };

    const cancelTimeout = () => {
      refreshActivityTime();
      updateWarnValue(false);
    };

    const handleUserEvents = (addListener: boolean) => {
      document.removeEventListener('pointerup', refreshActivityTime);
      document.removeEventListener('keyup', refreshActivityTime);
      if (addListener) {
        document.addEventListener('pointerup', refreshActivityTime, {
          passive: true,
        });
        document.addEventListener('keyup', refreshActivityTime);
      }
    };

    const handleAccessTokenExpiring = () => {
      const status = getActivityStatus();
      if (status === 'stopped') {
        return;
      } else if (status === 'ok') {
        renewToken();
      } else {
        trackerRef.current.tokenIsExpiring = true;
      }
    };

    const startActivityChecker = () => {
      startTimer();
      handleUserEvents(true);
      authService.userManager.events.addAccessTokenExpiring(
        handleAccessTokenExpiring
      );
    };

    const stopActivityChecker = () => {
      stopTimer();
      handleUserEvents(false);
      authService.userManager.events.removeAccessTokenExpiring(
        handleAccessTokenExpiring
      );
    };

    return {
      refreshActivityTime,
      updateWarnValue,
      getActivityStatus,
      renewToken,
      startActivityChecker,
      stopActivityChecker,
      handleUserEvents,
      cancelTimeout,
      startTimer,
      stopTimer,
      isTracking,
    };
  }, [updateState, authService]);

  useEffect(() => {
    const { startActivityChecker, stopActivityChecker } = trackingFunctions;
    authService.waitForAuthentication().then(() => {
      startActivityChecker();
    });
    return () => {
      stopActivityChecker();
    };
  }, [trackingFunctions, authService]);

  return {
    warn: trackerRef.current.warn,
    cancelTimeout: trackingFunctions.cancelTimeout,
  };
}
