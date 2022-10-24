import React, { useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Button, LoadingSpinner } from 'hds-react';
import { useHistory } from 'react-router';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import styles from './deleteProfile.module.css';
import useDeleteProfile from '../../../gdprApi/useDeleteProfile';
import ModalServicesContent from '../modals/deleteProfileContent/DeleteProfileContent';
import { useFocusSetter } from '../../hooks/useFocusSetter';
import ProfileSection from '../../../common/profileSection/ProfileSection';

function DeleteProfile(): React.ReactElement {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showServerErrorModal, setShowServerErrorModal] = useState(false);
  const notStartedLoadState = 'not-started';
  const deletedCompleteLoadState = 'delete-complete';
  const dryRunningLoadState = 'dry-running';
  const dryRunCompleteLoadState = 'dry-run-complete';
  const deletingLoadState = 'deleting';
  const errorLoadState = 'error';
  const history = useHistory();
  const { trackEvent } = useMatomo();

  const { t } = useTranslation();

  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `delete-profile-button`,
  });

  const toggleConfirmationModal = (show: boolean) => {
    setShowConfirmationModal(show);
    if (!show) {
      // test this...
      setFocusToRemoveButton();
    }
  };

  const [
    dryRunDeletion,
    deleteProfile,
    { serviceConnections, dryRunResult, deleteResult },
    loading,
  ] = useDeleteProfile({
    onDeleteCompleted: () => {
      trackEvent({ category: 'action', action: 'Delete profile' });
      history.push('/profile-deleted');
    },
    onDryRunCompleted: () => {
      toggleConfirmationModal(true);
    },
    onError: error => {
      if ((error as ApolloError).graphQLErrors) {
        (error as ApolloError).graphQLErrors.forEach(graphQlError => {
          Sentry.captureException(new Error(graphQlError.message));
        });
      } else {
        Sentry.captureException(error);
      }
      setShowServerErrorModal(true);
      setShowConfirmationModal(false);
    },
  });

  const getLoadState = () => {
    const dryRunComplete =
      dryRunResult && (dryRunResult.results || dryRunResult.error);
    const deleteComplete =
      dryRunComplete && deleteResult && deleteResult.results;

    if (dryRunResult?.error || deleteResult?.error || deleteResult?.error) {
      return errorLoadState;
    }
    if (loading && dryRunComplete) {
      return deletingLoadState;
    }
    if (!loading && dryRunComplete) {
      return dryRunCompleteLoadState;
    }
    if (deleteComplete) {
      return deletedCompleteLoadState;
    }
    if (loading) {
      return dryRunningLoadState;
    }
    return notStartedLoadState;
  };

  const dataLoadState = getLoadState();

  const handleDeleteClick = () => {
    if (loading) {
      return;
    }
    dryRunDeletion();
  };

  const handleProfileDelete = async () => {
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

  return (
    <ProfileSection data-test-id={'delete-profile'}>
      <h2>{t('deleteProfile.title')}</h2>
      <p dangerouslySetInnerHTML={{ __html: t('deleteProfile.explanation') }} />
      {dataLoadState === dryRunningLoadState ? (
        <LoadIndicator text={t('deleteProfile.loadingServices')} />
      ) : (
        <Button
          type="button"
          onClick={handleDeleteClick}
          disabled={showConfirmationModal}
          className={styles.button}
          id={removeButtonId}
        >
          {t('deleteProfile.delete')}
        </Button>
      )}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => toggleConfirmationModal(false)}
        onConfirm={handleProfileDelete}
        content={() => (
          <ModalServicesContent
            hasError={dataLoadState === errorLoadState}
            isDeleting={
              dataLoadState === deletingLoadState ||
              dataLoadState === deletedCompleteLoadState
            }
            dryRunResult={dryRunResult}
            serviceConnections={serviceConnections}
          />
        )}
        title={t('deleteProfileModal.title')}
        actionButtonText={t('deleteProfileModal.delete')}
      />
      <ConfirmationModal
        isOpen={showServerErrorModal}
        onClose={() => setShowServerErrorModal(false)}
        onConfirm={() => setShowServerErrorModal(false)}
        content={() => (
          <p data-testid={'server-error'}>
            {t('deleteProfileModal.genericError')}
          </p>
        )}
        title={t('deleteProfileModal.title')}
        closeButtonText={t('notification.closeButtonText')}
      />
    </ProfileSection>
  );
}

export default DeleteProfile;
