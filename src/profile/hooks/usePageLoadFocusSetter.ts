import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import getElementAndSetFocus from '../helpers/getElementAndSetFocus';
export const pageLoadFocusTargetClassName = 'page-load-focus-element';

type RedirectState = {
  state: {
    isRedirect: boolean;
  };
};

export function getLinkRedirectState(): RedirectState['state'] {
  return {
    isRedirect: true,
  };
}

export function usePageLoadFocusSetter(props?: { selector?: string; disableFocusing?: boolean }): void {
  const location = useLocation();
  const navType = useNavigationType(); // "POP", "PUSH", "REPLACE"
  const { disableFocusing = false, selector } = props || {};

  useEffect(() => {
    if (disableFocusing) {
      return;
    }

    // Only focus on internal navigation (PUSH or REPLACE), not POP (like back button)
    // and not when isRedirect is set to true
    const isRedirect = location.state?.isRedirect;

    if (!isRedirect && (navType === 'PUSH' || navType === 'REPLACE')) {
      if (selector) {
        getElementAndSetFocus(selector);
      } else {
        getElementAndSetFocus(`.${pageLoadFocusTargetClassName}`) || getElementAndSetFocus('h1');
      }
    }
  }, [disableFocusing, location, navType, selector]);
}
