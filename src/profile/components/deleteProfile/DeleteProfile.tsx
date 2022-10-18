import React, { useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Button, LoadingSpinner, Notification } from 'hds-react';
import { useHistory } from 'react-router';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import styles from './deleteProfile.module.css';
import useDeleteProfile from '../../../gdprApi/useDeleteProfile';
import ModalServicesContent from '../modals/deleteProfileContent/DeleteProfileContent';
import { useFocusSetter } from '../../hooks/useFocusSetter';
import DeleteProfileError from '../modals/deleteProfileError/DeleteProfileError';
import ProfileSection from '../../../common/profileSection/ProfileSection';

function DeleteProfile(): React.ReactElement {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const notStartedLoadState = 'not-started';
  const loadingLoadState = 'loading';
  const loadedLoadState = 'loaded';
  const dryRunComplete = 'dry-run-complete';
  const errorLoadState = 'error';
  const history = useHistory();
  const { trackEvent } = useMatomo();
  const [resultError, setResultError] = useState<
    ApolloError | Error | undefined
  >(undefined);
  const { t } = useTranslation();

  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `delete-profile-button`,
  });

  const handleConfirmationModal = () => {
    setShowConfirmationModal(prevState => !prevState);
    setFocusToRemoveButton();
  };
  const [
    dryRunDeletion,
    deleteProfile,
    {
      loading,
      dryRun,
      serviceConnections,
      dryRunError,
      deleteError,
      dryRunFailures,
      dryRunResult,
      deleteResult,
    },
  ] = useDeleteProfile({
    onDeleteCompleted: () => {
      trackEvent({ category: 'action', action: 'Delete profile' });
      history.push('/profile-deleted');
    },
    onDryRunCompleted: (result, failures) => {
      handleConfirmationModal();
    },
    onError: error => {
      if (dryRun) {
        handleConfirmationModal();
      } else {
        if ((error as ApolloError).graphQLErrors) {
          (error as ApolloError).graphQLErrors.forEach(graphQlError => {
            Sentry.captureException(new Error(graphQlError.message));
          });
        } else {
          Sentry.captureException(error);
        }
        setResultError(error as Error);
      }
    },
  });

  const getLoadState = () => {
    /*console.log('dataLoadState', {
      loading,
      dryRun,
      serviceConnections,
      dryRunError,
      deleteError,
      dryRunFailures,
      dryRunResult,
      deleteResult,
    });*/
    if (loading) {
      return loadingLoadState;
    }
    if (loading) {
      return loadingLoadState;
    }
    if (dryRunError || deleteError) {
      return errorLoadState;
    }
    if (dryRun && (dryRunFailures || dryRunResult)) {
      return dryRunComplete;
    }
    if (deleteResult) {
      return loadedLoadState;
    }
    return notStartedLoadState;
  };

  const dataLoadState = getLoadState();

  console.log('dataLoadState', dataLoadState);

  const handleDeleteClick = () => {
    console.log('handleDeleteClick', dataLoadState);
    if (dataLoadState === loadingLoadState) {
      return;
    }
    if (dataLoadState === loadedLoadState) {
      dryRunDeletion();
    } else {
      dryRunDeletion();
    }
  };

  const handleProfileDelete = async () => {
    setShowConfirmationModal(false);
    deleteProfile();
  };

  const LoadIndicator = ({ text }: { text: string }) => (
    <div
      className={styles['loading-info']}
      aria-live="polite"
      aria-busy="true"
      data-testid="delete-profile-load-indicator"
    >
      <LoadingSpinner small />
      <p>{text}</p>
    </div>
  );
  const ServiceConnectionLoadError = () => (
    <Notification label={t('notification.defaultErrorText')} type={'error'}>
      <Button
        type="button"
        onClick={() => dryRunDeletion()}
        className={styles.button}
        data-testid="reload-service-connections"
      >
        {t('notification.tryAgain')}
      </Button>
    </Notification>
  );
  const LoadStateIndicator = () =>
    dataLoadState === errorLoadState ? (
      <ServiceConnectionLoadError />
    ) : (
      <LoadIndicator text={t('deleteProfile.loadingServices')} />
    );

  return (
    <ProfileSection hasVerifiedUserData data-test-id={'delete-profile'}>
      <h2>{t('deleteProfile.title')}</h2>
      <p dangerouslySetInnerHTML={{ __html: t('deleteProfile.explanation') }} />
      {dataLoadState === loadingLoadState ||
      dataLoadState === errorLoadState ? (
        <LoadStateIndicator />
      ) : (
        <Button
          type="button"
          onClick={handleDeleteClick}
          className={styles.button}
          id={removeButtonId}
        >
          {t('deleteProfile.delete')}
        </Button>
      )}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleConfirmationModal}
        onConfirm={handleProfileDelete}
        content={() => (
          <ModalServicesContent
            data={serviceConnections}
            failedDryRunConnections={dryRunFailures}
          />
        )}
        title={t('deleteProfileModal.title')}
        actionButtonText={t('deleteProfileModal.delete')}
      />
      <DeleteProfileError
        error={resultError}
        onClose={() => setResultError(undefined)}
      />
    </ProfileSection>
  );
}

export default DeleteProfile;
