import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import { gdprQueryScopeGetterAction } from './queueActions/loadServiceConnectionsAction';
import {
  useActionQueue,
  HookFunctions,
  InitialQueue,
  Logger,
  HookCallback,
  createActionQueueCompleteExecutor,
} from '../common/actionQueue/useActionQueue';
import {
  ActionType,
  Action,
  QueueFunctions,
} from '../common/actionQueue/actionQueue';
import { downloadAsFileAction } from './queueActions/downloadAsFileAction';
import { downloadProfileDataAction } from './queueActions/downloadProfileDataAction';
import { keycloakAuthorizationRedirectionAction } from './queueActions/keycloakAuthorizationCodeRedirectionAction';
import {
  getkeycloakAuthorizationCode,
  keycloakAuthorizationCodeHandlerAction,
} from './queueActions/keycloakAuthorizationCodeHandlerAction';
import {
  getTunnistamoAuthorizationCode,
  tunnistamoAuthorizationCodeHandlerAction,
} from './queueActions/tunnistamoAuthorizationCodeHandlerAction';
import { tunnistamoAuthorizationCodeRedirectionAction } from './queueActions/tunnistamoAuthorizationCodeRedirectionAction.';

export function useDownloadProfileQueueD(props?: {
  startFrom?: ActionType;
  onCompleted?: HookCallback;
  onError?: HookCallback;
  doNotClearOnUnmount?: boolean;
}): HookFunctions {
  const { startFrom, onCompleted, onError, doNotClearOnUnmount } = props || {};
  const [, update] = useState(0);
  const history = useHistory();
  const updateComponent = useCallback(() => {
    update(p => p + 1);
  }, [update]);
  const queue: InitialQueue = useMemo(
    (): InitialQueue => [
      gdprQueryScopeGetterAction,
      tunnistamoAuthorizationCodeRedirectionAction,
      tunnistamoAuthorizationCodeHandlerAction,
      keycloakAuthorizationRedirectionAction,
      keycloakAuthorizationCodeHandlerAction,

      {
        type: 'redirectToProfilePage',
        executor: () => {
          history.push('/?startDownload');
          // get code
          return Promise.resolve();
        },
        options: {
          syncronousCompletion: true,
        },
      },
      {
        type: 'waitForRedirection',
        executor: (action, queueFunctions) => {
          //....
          const authorizationCode = getTunnistamoAuthorizationCode(
            queueFunctions
          );
          const authorizationCodeKeycloak = getkeycloakAuthorizationCode(
            queueFunctions
          );
          const code = authorizationCodeKeycloak || authorizationCode;
          console.log('#CODE#', code);
          return code
            ? Promise.resolve(code)
            : Promise.reject(new Error('no code'));
        },
      },
      downloadProfileDataAction,
      downloadAsFileAction,
      {
        type: 'finish',
        executor: createActionQueueCompleteExecutor(),
      },
    ],
    [history]
  );

  const resolveNextAction = (
    { isComplete, getFirstIdle, getActive, getFailed }: QueueFunctions,
    startFromType?: ActionType
  ): Action | undefined => {
    if (isComplete() || !!getFailed()) {
      return undefined;
    }
    const active = getActive();
    console.log('active', active);
    if (active && active.type === 'redirectToProfilePage') {
      if (window.location.search === '?startDownload') {
        return active;
      }
    }
    if (startFromType && active && active.type === startFromType) {
      return active;
    }
    const firstIdle = getFirstIdle();
    if (firstIdle && firstIdle.type === gdprQueryScopeGetterAction.type) {
      return firstIdle;
    }
    return undefined;
  };
  const logger: Logger = useCallback(
    (type, action, queueFunctions) => {
      console.log('###', type, action);
      updateComponent();
      if (type === 'completed' && action.type === 'finish') {
        console.log('######');
        console.log('######');
        console.log('DONE');
        console.log('######');
        console.log('######');
        if (onCompleted) {
          onCompleted(action, queueFunctions);
        }
        queueFunctions.clean();
      }
      if (type === 'error' && onError) {
        onError(action, queueFunctions);
        queueFunctions.clean();
      }
    },
    [onError, onCompleted, updateComponent]
  );
  const functions = useActionQueue(queue, logger);

  const start = (startFromType?: ActionType) => {
    const next = resolveNextAction(functions, startFromType);
    if (!next) {
      return undefined;
    }
    console.log('next', next);
    if (startFromType && !functions.canStartFrom(startFromType)) {
      console.log('startFromType failure');
      history.push('/?ups');
      return undefined;
    }
    if (startFromType) {
      return functions.start(startFromType);
    } else {
      return functions.start();
    }
  };

  useEffect(() => {
    console.log('next', resolveNextAction(functions));
    console.log('startFrom', startFrom);
    if (startFrom) {
      if (!functions.canStartFrom(startFrom)) {
        console.log('RDIR');
      } else {
        console.log('s');
        functions.start(startFrom);
      }
    }
  }, [functions, startFrom]);

  useEffect(() => {
    console.log('RENDER');
    return () => {
      console.log('UNLOAD');
      if (!doNotClearOnUnmount) {
        functions.cleanUp();
      }
    };
  }, [functions, doNotClearOnUnmount]);
  return {
    ...functions,
    start,
  };
}
