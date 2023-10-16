import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import styles from './gdprAuthorizationCodeManagerCallback.module.css';
import useAuthCodeQueues, {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from './useAuthCodeQueues';
import { getStoredQueueData } from '../common/actionQueue/actionQueueStorage';
import { useErrorPageRedirect } from '../profile/hooks/useErrorPageRedirect';
import { QueueState } from '../common/actionQueue/useActionQueue';
import { QueueController } from '../common/actionQueue/actionQueue';
import { didFailedActionRedirect } from './actions/utils';

function GdprAuthorizationCodeManagerCallback(): React.ReactElement {
  const redirectToErrorPage = useErrorPageRedirect();
  const { t } = useTranslation();
  //const history = useHistory();
  const storedData = useMemo(
    () => getStoredQueueData(authCodeQueuesStorageKey) || {},
    []
  );
  const onError = useCallback(
    (controller: QueueController, state: QueueState) => {
      const failedAction = controller.getFailed();
      if (!failedAction || !didFailedActionRedirect(failedAction)) {
        console.log('action does not redirect', failedAction);
        // if storedData.startP....
        //history.push(`/?error=${failedAction ? failedAction.type : 'unknown'}`);
        // else
        redirectToErrorPage({
          message: t('notification.defaultErrorText'),
        });
      } else {
        console.log('action redirects', failedAction);
      }
    },
    [redirectToErrorPage, t]
  );
  const authCodeQueueProps = ({
    ...storedData,
    onError,
  } as unknown) as AuthCodeQueuesProps;
  const { shouldHandleCallback, resume } = useAuthCodeQueues(
    authCodeQueueProps
  );
  React.useEffect(() => {
    if (shouldHandleCallback()) {
      window.requestAnimationFrame(() => {
        resume();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles['wrapper']}>
      <div className={styles['fake-navigation']} />
      <div className={styles['fake-page-heading']} />
      <div className={styles['fake-content']} />
    </div>
  );
}

export default GdprAuthorizationCodeManagerCallback;
