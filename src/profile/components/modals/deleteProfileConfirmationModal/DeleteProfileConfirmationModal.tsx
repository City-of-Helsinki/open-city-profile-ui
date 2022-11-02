import { Link, LoadingSpinner } from 'hds-react';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DeleteProfileResult } from '../../../../gdprApi/useDeleteProfile';
import styles from '../../deleteProfile/deleteProfile.module.css';
import ConfirmationModal from '../confirmationModal/ConfirmationModal';

type Props = Pick<
  DeleteProfileResult,
  'dryRunResult' | 'serviceConnections'
> & {
  isDeleting: boolean;
  hasError: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteProfileConfirmationModal(
  props: Props
): React.ReactElement | null {
  const {
    dryRunResult,
    serviceConnections,
    isDeleting,
    hasError,
    isOpen,
    onClose,
    onConfirm,
  } = props;
  const [removables, failures] = useMemo(() => {
    if (!serviceConnections) {
      return [[], []];
    }
    const failedServices =
      dryRunResult && dryRunResult.results
        ? dryRunResult.results.reduce((currentList, currentResult) => {
            if (
              currentResult &&
              !currentResult.success &&
              currentResult.service
            ) {
              currentList.add(currentResult.service.name);
            }
            return currentList;
          }, new Set<string>())
        : new Set();

    if (!failedServices.size) {
      return [serviceConnections, []];
    }

    const didServiceDryRunFail = (name: string) => failedServices.has(name);

    return [
      serviceConnections.filter(service => !didServiceDryRunFail(service.name)),
      serviceConnections.filter(service => didServiceDryRunFail(service.name)),
    ];
  }, [dryRunResult, serviceConnections]);

  const hasFailedServices = failures.length;
  const hasServices = !!serviceConnections && !!serviceConnections.length;
  const { t } = useTranslation();
  const title = t('deleteProfileModal.title');
  const actionButtonText = hasFailedServices
    ? undefined
    : t('deleteProfileModal.delete');
  const closeButtonText = hasFailedServices
    ? t('notification.closeButtonText')
    : t('confirmationModal.cancel');

  const ModalContent = () => {
    const description = hasServices
      ? t('deleteProfileModal.explanation')
      : t('deleteProfileModal.noServiceExplanation');
    if (hasError) {
      return <p>{t('deleteProfileModal.genericError')}</p>;
    }
    if (isDeleting) {
      return (
        <div
          aria-live="polite"
          aria-busy="true"
          data-testid="delete-profile-load-indicator"
          className={styles['loading-info']}
        >
          <LoadingSpinner small />
          <p>{t('notification.removing')}</p>
        </div>
      );
    }

    const SuccessListDescription = () => {
      if (!removables.length) {
        return null;
      }
      if (hasFailedServices) {
        return (
          <Trans
            i18nKey="deleteProfileModal.deleteServiceFromPage"
            components={{
              linkToServices: (
                <Link href={'/connected-services'} size="M">
                  {''}
                </Link>
              ),
              linkToServicesText: t('nav.services'),
            }}
          />
        );
      }
      return <p>{description}</p>;
    };

    const FailureListNote = () => (
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
    );

    return (
      <>
        <SuccessListDescription />
        {removables.length ? (
          <ul>
            {removables.map((service, index) => (
              <li key={index}>{service.title}</li>
            ))}
          </ul>
        ) : null}
        {hasFailedServices ? (
          <>
            <p>{t('deleteProfileModal.unableToDeleteServices')}</p>
            <ul>
              {failures.map((service, index) => (
                <li key={index}>{service.title}</li>
              ))}
            </ul>
            <FailureListNote />
          </>
        ) : null}
      </>
    );
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      content={ModalContent}
      title={title}
      actionButtonText={actionButtonText}
      closeButtonText={closeButtonText}
    />
  );
}

export default DeleteProfileConfirmationModal;
