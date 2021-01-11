import React from 'react';

function getActionFromParams() {
  return new URLSearchParams(window.location.search).get('a');
}

function getIsActionSearchParamEvoked(deferredAction: string): boolean {
  const actionToComplete = getActionFromParams();

  return actionToComplete === deferredAction;
}

function removeActionFromParams() {
  const url = new URL(window.location.href);
  const search = new URLSearchParams(window.location.search);

  search.delete('a');
  url.search = search.toString();

  window.history.replaceState(null, '', url.toString());
}

function useActionResumer(
  deferredAction: string,
  onActionInitialization: (...args: string[][]) => void,
  callback: () => void
): [() => void, boolean] {
  const isActionSearchParamEvoked = getIsActionSearchParamEvoked(
    deferredAction
  );
  const [isActionOngoing, setIsActionOngoing] = React.useState(
    isActionSearchParamEvoked
  );

  const startAction = React.useCallback(
    (...args: string[][]) => {
      setIsActionOngoing(true);

      onActionInitialization(...args);
    },
    [onActionInitialization]
  );

  React.useEffect(() => {
    function finishAction() {
      const actionToComplete = getActionFromParams();
      const shouldTryToCompleteAction = actionToComplete === deferredAction;

      if (shouldTryToCompleteAction) {
        callback();
        removeActionFromParams();
        setIsActionOngoing(false);
      }
    }

    finishAction();
  }, [callback, deferredAction]);

  return [startAction, isActionOngoing];
}

export default useActionResumer;
