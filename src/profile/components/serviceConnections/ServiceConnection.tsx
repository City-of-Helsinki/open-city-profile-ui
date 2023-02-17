import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import * as Sentry from '@sentry/browser';

import { ServiceConnectionData } from '../../helpers/getServiceConnectionData';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import CheckedLabel from '../../../common/checkedLabel/CheckedLabel';
import getAllowedDataFieldsFromService from '../../helpers/getAllowedDataFieldsFromService';
import styles from './ServiceConnections.module.css';
import useDeleteServiceConnection from '../../../gdprApi/useDeleteServiceConnection';
import DeleteServiceConnectionModal from './DeleteServiceConnectionModal';
import encodeServiceName from '../../helpers/encodeServiceName';
import StyledButton from '../../../common/styledButton/StyledButton';

export const STATUS_NONE = 0;
export const STATUS_PENDING_CONFIRMATION = 1;
export const STATUS_LOADING = 2;
export const STATUS_ERROR = 3;
export const STATUS_DELETE_FORBIDDEN = 4;
export const STATUS_DONE = 5;
export const STATUS_ACKNOWLEDGED = 6;
export const STATUS_CLOSED = 7;

export type DeletionStatus =
  | typeof STATUS_NONE
  | typeof STATUS_PENDING_CONFIRMATION
  | typeof STATUS_LOADING
  | typeof STATUS_ERROR
  | typeof STATUS_DELETE_FORBIDDEN
  | typeof STATUS_DONE
  | typeof STATUS_CLOSED
  | typeof STATUS_ACKNOWLEDGED;

function ServiceConnection(props: {
  service: ServiceConnectionData;
  onDeletion: (deletedService: ServiceConnectionData) => void;
}): React.ReactElement | null {
  const { service, onDeletion } = props;

  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus>(
    STATUS_NONE
  );

  const isLoading = deletionStatus === STATUS_LOADING;
  const isDone = deletionStatus === STATUS_DONE;

  const { t } = useTranslation();

  const getDateTime = (date: Date) => {
    const day = format(new Date(date), 'dd.MM.yyyy');
    const time = format(new Date(date), 'HH:mm');
    return `${day}, ${t('serviceConnections.clock')} ${time}`;
  };

  const [deleteConnection, authorizationCodeState] = useDeleteServiceConnection(
    service.name,
    {
      fetchPolicy: 'no-cache',
      onError: errorEvent => {
        if (errorEvent.graphQLErrors) {
          errorEvent.graphQLErrors.forEach(graphQlError => {
            Sentry.captureException(new Error(graphQlError.message));
          });
        } else {
          Sentry.captureException(errorEvent);
        }
        setDeletionStatus(STATUS_ERROR);
      },
      onCompleted: data => {
        if (!data.deleteMyServiceData?.result?.success) {
          setDeletionStatus(STATUS_DELETE_FORBIDDEN);
        } else {
          setDeletionStatus(STATUS_DONE);
        }
      },
    }
  );

  const getModalStatus = () => {
    const authorizationIsActive =
      authorizationCodeState.isLoading ||
      authorizationCodeState.hasCode ||
      authorizationCodeState.isDeleting;

    if (deletionStatus === STATUS_NONE && authorizationIsActive) {
      return STATUS_LOADING;
    }

    return deletionStatus;
  };

  const onDeleteClick = () => {
    if (isLoading) {
      return;
    }
    setDeletionStatus(STATUS_PENDING_CONFIRMATION);
  };

  const onClose = () => {
    if (isLoading) {
      return;
    }
    if (isDone) {
      setDeletionStatus(STATUS_ACKNOWLEDGED);
      onDeletion(service);
      return;
    }
    setDeletionStatus(STATUS_CLOSED);
  };

  const onConfirm = () => {
    setDeletionStatus(STATUS_LOADING);
    deleteConnection();
  };

  const modalStatus = getModalStatus();
  const encodedServiceName = encodeServiceName(service);

  return (
    <>
      <ExpandingPanel
        title={service.title || ''}
        showInformationText
        initiallyOpen={
          modalStatus !== STATUS_CLOSED && modalStatus !== STATUS_NONE
        }
      >
        <p>{service.description}</p>
        <div
          className={styles['service-information']}
          data-testid={`service-connection-${encodedServiceName}-information`}
        >
          <p>
            <strong>{t('serviceConnections.servicePersonalData')}</strong>
          </p>
          {getAllowedDataFieldsFromService(service).map(node => (
            <CheckedLabel
              key={node.fieldName}
              value={node.label || node.fieldName}
              className={styles['allowed-data-field']}
            />
          ))}
          <p className={styles['created-at']}>
            {t('serviceConnections.created')}
          </p>
          <p className={styles['date-and-time']}>
            {getDateTime(service.connectionCreatedAt)}
          </p>
        </div>
        <StyledButton
          onClick={onDeleteClick}
          data-testid={`delete-service-connection-${encodedServiceName}-button`}
        >
          {t('serviceConnections.deleteConnection')}
        </StyledButton>
      </ExpandingPanel>
      <DeleteServiceConnectionModal
        status={modalStatus}
        onClose={onClose}
        onConfirm={onConfirm}
        service={service}
      />
    </>
  );
}

export default ServiceConnection;
