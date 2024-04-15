import React, { useCallback, useEffect, useState } from 'react';

import { ServiceConnectionData } from '../../helpers/getServiceConnectionData';
import DeleteServiceConnectionModal from './DeleteServiceConnectionModal';
import useAuthCodeQueues, {
  AuthCodeQueuesProps,
} from '../../../gdprApi/useAuthCodeQueues';
import config from '../../../config';
import {
  isForbiddenResult,
  isInsufficientLoaResult,
} from '../../../gdprApi/actions/deleteServiceConnection';

export const STATUS_NONE = 0;
export const STATUS_PENDING_CONFIRMATION = 1;
export const STATUS_LOADING = 2;
export const STATUS_ERROR = 3;
export const STATUS_DELETE_FORBIDDEN = 4;
export const STATUS_DONE = 5;
export const STATUS_ACKNOWLEDGED = 6;
export const STATUS_CLOSED = 7;
export const STATUS_INSUFFICIENT_LOA = 8;

export type DeletionStatus =
  | typeof STATUS_NONE
  | typeof STATUS_PENDING_CONFIRMATION
  | typeof STATUS_LOADING
  | typeof STATUS_ERROR
  | typeof STATUS_DELETE_FORBIDDEN
  | typeof STATUS_DONE
  | typeof STATUS_CLOSED
  | typeof STATUS_ACKNOWLEDGED
  | typeof STATUS_INSUFFICIENT_LOA;

function ServiceConnectionRemover(props: {
  service: ServiceConnectionData;
  onDeletion: (deletedService: ServiceConnectionData) => void;
  onAbort: () => void;
}): React.ReactElement | null {
  const [errorMessage, setErrorMessage] = useState<string>();
  const { service, onDeletion, onAbort } = props;
  const onError: AuthCodeQueuesProps['onError'] = useCallback(controller => {
    const failed = controller.getFailed();
    const message = (failed && failed.errorMessage) || 'unknown';
    setErrorMessage(message);
  }, []);
  const {
    isLoading,
    startOrRestart,
    hasError,
    isComplete,
    shouldResumeWithAuthCodes,
    resume,
  } = useAuthCodeQueues({
    startPagePath: config.serviceConnectionsPath,
    queueName: 'deleteServiceConnection',
    serviceName: service.name,
    onError,
  });

  const isDeleted = isComplete && !hasError;

  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus>(
    isLoading
      ? STATUS_LOADING
      : isDeleted
      ? STATUS_DONE
      : STATUS_PENDING_CONFIRMATION
  );

  const getModalStatus = () => {
    if (hasError) {
      if (isForbiddenResult({ errorMessage, result: undefined })) {
        return STATUS_DELETE_FORBIDDEN;
      }

      if (isInsufficientLoaResult({ errorMessage, result: undefined })) {
        return STATUS_INSUFFICIENT_LOA;
      }

      return STATUS_ERROR;
    }

    if (isLoading) {
      return STATUS_LOADING;
    }
    if (isDeleted) {
      return STATUS_DONE;
    }

    return deletionStatus;
  };

  const onClose = () => {
    if (isLoading) {
      return;
    }
    if (isDeleted) {
      setDeletionStatus(STATUS_ACKNOWLEDGED);
      onDeletion(service);
      return;
    }
    onAbort();
  };

  const onConfirm = () => {
    setDeletionStatus(STATUS_LOADING);
    startOrRestart();
  };

  const modalStatus = getModalStatus();
  useEffect(() => {
    if (!isLoading && shouldResumeWithAuthCodes()) {
      resume();
    }
  });

  return (
    <DeleteServiceConnectionModal
      status={modalStatus}
      onClose={onClose}
      onConfirm={onConfirm}
      service={service}
    />
  );
}

export default ServiceConnectionRemover;
