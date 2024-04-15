import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'hds-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import { ServiceConnectionData } from '../../helpers/getServiceConnectionData';
import Loading from '../../../common/loading/Loading';
import {
  DeletionStatus,
  STATUS_DELETE_FORBIDDEN,
  STATUS_DONE,
  STATUS_ERROR,
  STATUS_LOADING,
  STATUS_PENDING_CONFIRMATION,
  STATUS_INSUFFICIENT_LOA,
} from './ServiceConnectionRemover';

function DeleteServiceConnectionModal(props: {
  service: ServiceConnectionData;
  status: DeletionStatus;
  onConfirm: () => void;
  onClose: () => void;
}): React.ReactElement | null {
  const { service, status, onConfirm, onClose } = props;
  const { t } = useTranslation();

  const cannotDelete = status === STATUS_DELETE_FORBIDDEN;
  const isInsufficientLoa = status === STATUS_INSUFFICIENT_LOA;
  const isError = cannotDelete || isInsufficientLoa;
  const hasError = status === STATUS_ERROR || isError;
  const isLoading = status === STATUS_LOADING;
  const isDone = status === STATUS_DONE;
  const isPendingUserConfirmation = status === STATUS_PENDING_CONFIRMATION;
  const isFinished = isDone || hasError;

  const shouldShowModal =
    isLoading || isError || isPendingUserConfirmation || isFinished;

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

  const onCloseConfirmationModal = () => {
    if (isLoading) {
      return;
    }
    onClose();
  };

  const onConfirmConfirmationModal = () => {
    onConfirm();
  };

  const ModalContent = () => {
    if (isLoading) {
      return (
        <Loading
          isLoading
          dataTestId="service-connection-delete-load-indicator"
          loadingText={t('notification.removing')}
          alignLeft
        />
      );
    }
    if (hasError) {
      if (cannotDelete) {
        return (
          <>
            <p data-testid="service-connection-delete-forbidden-text">
              {t('serviceConnections.connectionRemovalForbidden')}
            </p>
            <Trans
              i18nKey="serviceConnections.contactServiceToDelete"
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

      if (isInsufficientLoa) {
        return (
          <p data-testid="service-connection-insufficient-load-text">
            {t('serviceConnections.connectionInsufficientLoa')}
          </p>
        );
      }

      return (
        <p data-testid="service-connection-delete-failed-text">
          {t('serviceConnections.connectionRemovalError')}
        </p>
      );
    }
    if (isDone) {
      return (
        <p data-testid="service-connection-delete-successful-text">
          {t('serviceConnections.connectionRemovalSuccess', {
            serviceName: service.title,
          })}
        </p>
      );
    }
    return (
      <p data-testid="service-connection-delete-verification-text">
        {t('serviceConnections.connectionRemovalVerification', {
          serviceName: service.title,
        })}
      </p>
    );
  };

  if (!shouldShowModal) {
    return null;
  }
  return (
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
  );
}

export default DeleteServiceConnectionModal;
