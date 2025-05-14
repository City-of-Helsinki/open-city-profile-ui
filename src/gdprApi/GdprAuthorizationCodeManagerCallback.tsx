import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import styles from './gdprAuthorizationCodeManagerCallback.module.css';
import useAuthCodeQueues, {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from './useAuthCodeQueues';
import { getStoredQueueData } from '../common/actionQueue/actionQueueStorage';
import { useErrorPageRedirect } from '../profile/hooks/useErrorPageRedirect';
import { Action, QueueController } from '../common/actionQueue/actionQueue';
import {
  createPagePathWithFailedActionParams,
  didFailedActionRedirect,
} from './actions/utils';

function GdprAuthorizationCodeManagerCallback(): React.ReactElement {
  const redirectToErrorPage = useErrorPageRedirect();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const storedData = useMemo<Partial<AuthCodeQueuesProps>>(
    () => getStoredQueueData(authCodeQueuesStorageKey) || {},
    []
  );

  const redirectAfterError = useCallback(
    (failedAction?: Action) => {
      if (!failedAction || !didFailedActionRedirect(failedAction)) {
        const path = storedData.startPagePath as string;
        if (path) {
          navigate(
            createPagePathWithFailedActionParams(
              path,
              failedAction || ({ type: 'unknown' } as Action),
              'Failed GDPR callback'
            )
          );
        } else {
          redirectToErrorPage({
            message: t('notification.defaultErrorText'),
          });
        }
      }
    },
    [redirectToErrorPage, t, navigate, storedData.startPagePath]
  );

  const onError = useCallback(
    (controller: QueueController) => {
      redirectAfterError(controller.getFailed());
    },
    [redirectAfterError]
  );

  const memoizedProps = useMemo<AuthCodeQueuesProps>(
    () =>
      ({
        ...storedData,
        onError,
      } as AuthCodeQueuesProps),
    [storedData, onError]
  );

  const { shouldHandleCallback, resume } = useAuthCodeQueues(memoizedProps);
  React.useEffect(() => {
    if (shouldHandleCallback()) {
      resume();
    } else {
      redirectAfterError();
    }
  }, [shouldHandleCallback, resume, redirectAfterError]);

  return (
    <div className={styles['wrapper']}>
      <div className={styles['fake-navigation']} />
      <div className={styles['fake-page-heading']} />
      <div className={styles['fake-content']} />
    </div>
  );
}

export default GdprAuthorizationCodeManagerCallback;
