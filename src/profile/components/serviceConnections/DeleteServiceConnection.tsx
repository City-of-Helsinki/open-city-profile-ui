import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Link } from 'hds-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import useDeleteServiceConnection from '../../../gdprApi/useDeleteServiceConnection';
import { ServiceConnectionData } from '../../helpers/getServiceConnectionData';
import commonStyles from '../../../common/cssHelpers/common.module.css';
import Loading from '../../../common/loading/Loading';

function DeleteServiceConnection(props: {
  service: ServiceConnectionData;
  onDeletion: (deletedService: ServiceConnectionData) => void;
}): React.ReactElement | null {
  const { service } = props;
  const states = {
    none: 'none',
    pendingConfirmation: 'pendingConfirmation',
    loading: 'loading',
    error: 'error',
    deleteForbidden: 'deleteForbidden',
    done: 'done',
    acknowledged: 'acknowledged',
  } as const;
  const { t } = useTranslation();
  const [deletionState, setDeletionState] = useState<keyof typeof states>(
    states.none
  );

  const [deleteConnection] = useDeleteServiceConnection(service.name, {
    fetchPolicy: 'no-cache',
    onError: errorEvent => {
      if (errorEvent.graphQLErrors) {
        errorEvent.graphQLErrors.forEach(graphQlError => {
          Sentry.captureException(new Error(graphQlError.message));
        });
      } else {
        Sentry.captureException(errorEvent);
      }
      setDeletionState(states.error);
    },
    onCompleted: data => {
      if (!data.deleteMyServiceData?.result?.success) {
        setDeletionState(states.deleteForbidden);
      } else {
        setDeletionState(states.done);
      }
    },
  });

  const hasError =
    deletionState === states.error || deletionState === states.deleteForbidden;
  const isLoading = deletionState === states.loading;
  const isDone = deletionState === states.done;
  const isFinished = isDone || hasError;
  const shouldShowModal =
    deletionState !== states.none && deletionState !== states.acknowledged;

  const getModalTitle = () => {
    if (hasError) {
      return t('notification.removeError');
    }
    if (isDone) {
      return t('notification.removeSuccess');
    }
    return t('serviceConnections.connectionRemovalVerificationTitle');
  };

  const getActionButtonText = () => {
    if (isLoading || isFinished) {
      return undefined;
    }
    return t('serviceConnections.connectionRemovalVerificationButtonText');
  };

  const getCloseButtonText = () => {
    if (isLoading) {
      return '';
    }
    if (isFinished) {
      return t('confirmationModal.close');
    }
    return t('confirmationModal.cancel');
  };

  const onClick = () => {
    if (isLoading) {
      return;
    }
    setDeletionState(states.pendingConfirmation);
  };

  const onCloseConfirmationModal = () => {
    if (isLoading) {
      return;
    }
    if (isDone) {
      setDeletionState(states.acknowledged);
      props.onDeletion(service);
      return;
    }
    if (hasError) {
      setDeletionState(states.none);
      return;
    }
    setDeletionState(states.none);
  };

  const onConfirmConfirmationModal = () => {
    setDeletionState(states.loading);
    deleteConnection();
  };

  const ModalContent = () => {
    if (isLoading) {
      return (
        <Loading
          isLoading
          dataTestId="delete-service-connection-load-indicator"
          loadingText={t('notification.removing')}
          alignLeft
        />
      );
    }
    if (hasError) {
      if (deletionState === states.deleteForbidden) {
        return (
          <>
            <p>{t('serviceConnections.connectionRemovalForbidden')}</p>
            <Trans
              i18nKey="deleteProfileModal.contactServiceToDelete"
              components={{
                linkToExternalServiceList: (
                  <Link
                    href={t('deleteProfileModal.urlToServiceList')}
                    external
                    openInNewTab
                    size="M"
                  >
                    {''}
                  </Link>
                ),
              }}
            />
          </>
        );
      }
      return <p>{t('deleteProfile.deleteFailed')}</p>;
    }
    if (isDone) {
      return (
        <p>
          {t('serviceConnections.connectionRemovalSuccess', {
            serviceName: service.title,
          })}
        </p>
      );
    }
    return (
      <p>
        {t('serviceConnections.connectionRemovalVerification', {
          serviceName: service.title,
        })}
      </p>
    );
  };

  if (deletionState === states.acknowledged) {
    return null;
  }

  return (
    <>
      <Trans
        i18nKey="serviceConnections.deleteConnection"
        components={{
          deleteButton: (
            <button onClick={onClick} className={commonStyles['text-button']}>
              {''}
            </button>
          ),
        }}
      />

      <ConfirmationModal
        isOpen={shouldShowModal}
        onClose={onCloseConfirmationModal}
        onConfirm={onConfirmConfirmationModal}
        content={() => <ModalContent />}
        title={getModalTitle()}
        actionButtonText={getActionButtonText()}
        closeButtonText={getCloseButtonText()}
        preventClosing={isLoading}
      />
    </>
  );
}

export default DeleteServiceConnection;
