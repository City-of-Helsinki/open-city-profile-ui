import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Button, LoadingSpinner, Notification } from 'hds-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import useDeleteServiceConnection from '../../../gdprApi/useDeleteServiceConnection';
import { ServiceConnectionData } from '../../helpers/getServiceConnectionData';
import commonStyles from '../../../common/cssHelpers/common.module.css';

function DeleteServiceConnection(props: {
  service: ServiceConnectionData;
  onDeletion: (deletedService: ServiceConnectionData) => void;
}): React.ReactElement | null {
  const { service } = props;
  const { t } = useTranslation();
  const [resultError, setResultError] = useState(false);
  const [userRequestedDeletion, setUserRequestedDeletion] = useState(false);

  const [
    deleteConnection,
    queryStatus,
    accessCodeStatus,
  ] = useDeleteServiceConnection(service.name, {
    fetchPolicy: 'no-cache',
    onError: errorEvent => {
      if (errorEvent.graphQLErrors) {
        errorEvent.graphQLErrors.forEach(graphQlError => {
          Sentry.captureException(new Error(graphQlError.message));
        });
      } else {
        Sentry.captureException(errorEvent);
      }
      setResultError(true);
    },
    onCompleted: () => {
      props.onDeletion(service);
    },
  });

  if (queryStatus.data) {
    return null;
  }
  if (accessCodeStatus.loading || queryStatus.loading) {
    return <LoadingSpinner small />;
  }
  console.log('accessCodeStatus', accessCodeStatus);
  console.log('queryStatus', queryStatus);
  if (resultError) {
    return (
      <Notification
        type={'error'}
        label={t('notification.genericError')}
        dataTestId={'service-connections-load-error'}
      >
        <p>{t('notification.defaultErrorText')}</p>
        <Button
          onClick={() => {
            deleteConnection();
          }}
        >
          {t('notification.tryAgain')}
        </Button>
      </Notification>
    );
  }

  const onClick = () => {
    setUserRequestedDeletion(true);
    deleteConnection();
  };
  const onCloseConfirmationModal = () => {
    setUserRequestedDeletion(false);
  };
  const onConfirmConfirmationModal = () => deleteConnection();
  const ModalContent = () => (
    <p>{t('serviceConnections.connectionRemovalVerification')}</p>
  );
  return (
    <>
      <Trans
        i18nKey="serviceConnections.deleteConnection"
        components={{
          buttonPlaceholder: (
            <button onClick={onClick} className={commonStyles['text-button']}>
              {''}
            </button>
          ),
        }}
      />

      <ConfirmationModal
        isOpen={userRequestedDeletion}
        onClose={onCloseConfirmationModal}
        onConfirm={onConfirmConfirmationModal}
        content={() => <ModalContent />}
        title={t('deleteProfileModal.title')}
        actionButtonText={t('deleteProfileModal.delete')}
      />
    </>
  );
}

export default DeleteServiceConnection;
