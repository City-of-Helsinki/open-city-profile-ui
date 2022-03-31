import { useEffect } from 'react';

import getElementAndSetFocus from '../helpers/getElementAndSetFocus';
import { useHistoryTracker } from './useHistoryListener';

export const pageLoadFocusTargetClassName = 'page-load-focus-element';

export function usePageLoadFocusSetter(props?: {
  selector?: string;
  disableFocusing?: boolean;
}): void {
  const trackingData = useHistoryTracker();
  const { disableFocusing = false, selector } = props || {};

  useEffect(() => {
    if (disableFocusing) {
      return;
    }
    if (trackingData.hasInternalPageLoads) {
      if (selector) {
        getElementAndSetFocus(selector);
      } else {
        getElementAndSetFocus(`.${pageLoadFocusTargetClassName}`) ||
          getElementAndSetFocus('h1');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
