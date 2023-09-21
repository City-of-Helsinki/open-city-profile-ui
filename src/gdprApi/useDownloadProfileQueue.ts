import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import { authorizationRedirectParserExecutor } from './queueActions/authorizationCodeRedirectExecutor';
import { gdprQueryScopeGetterAction } from './queueActions/loadServiceConnectionsExecutor';
import {
  useActionQueue,
  HookFunctions,
  InitialQueue,
  Logger,
  HookCallback,
  createActionQueueCompleteExecutor,
  QueueFunctions,
} from '../common/actionQueue/useActionQueue';
import { ActionType, Action } from '../common/actionQueue/actionQueue';
import { downloadAsFileAction } from './queueActions/downloadAsFileExecutor';
import { downloadProfileDataAction } from './queueActions/downloadProfileDataExecutor';
import { keycloakAuthorizationRedirectionAction } from './queueActions/keycloakAuthorizationCodeRedirectExecutor';

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
      /*
      {
        type: 'getCode',
        executor: authorizationRedirectionExecutor,
      },
      */
      keycloakAuthorizationRedirectionAction,
      {
        type: 'consumeCode',
        executor: authorizationRedirectParserExecutor,
        options: {
          idleWhenActive: true,
        },
      },
      /*
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
          const code = queueFunctions.getResult('consumeCode');
          console.log('#CODE#', code);
          return code
            ? Promise.resolve(code)
            : Promise.reject(new Error('no code'));
        },
      },*/
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
