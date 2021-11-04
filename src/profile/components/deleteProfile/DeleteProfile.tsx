import React, { useCallback, useEffect, useState } from 'react';
import { ApolloError, useLazyQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Button, Checkbox, LoadingSpinner } from 'hds-react';
import { useHistory } from 'react-router';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import { ServiceConnectionsRoot } from '../../../graphql/typings';
import useToast from '../../../toast/useToast';
import styles from './deleteProfile.module.css';
import useDeleteProfile from '../../../gdprApi/useDeleteProfile';
import ModalServicesContent from '../modals/deleteProfileContent/DeleteProfileContent';
import { useFocusSetter } from '../../hooks/useFocusSetter';
import DeleteProfileError from '../modals/deleteProfileError/DeleteProfileError';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

function DeleteProfile(): React.ReactElement {
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteInstructions, setDeleteInstructions] = useState(false);
  const notStartedLoadState = 'not-started';
  const loadingLoadState = 'loading';
  const loadedLoadState = 'loaded';
  const [dataLoadState, setDataLoadState] = useState<
    | typeof notStartedLoadState
    | typeof loadingLoadState
    | typeof loadedLoadState
  >(notStartedLoadState);
  const { createToast } = useToast();
  const history = useHistory();
  const { trackEvent } = useMatomo();
  const [resultError, setResultError] = useState<
    ApolloError | Error | undefined
  >(undefined);
  const [deleteProfile, deleteProfileResult] = useDeleteProfile({
    onCompleted: returnedData => {
      if (returnedData) {
        trackEvent({ category: 'action', action: 'Delete profile' });
        history.push('/profile-deleted');
      }
    },
    onError: error => {
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach(graphQlError => {
          Sentry.captureException(new Error(graphQlError.message));
        });
      } else {
        Sentry.captureException(error);
      }
      setResultError(error);
    },
  });

  const { t, i18n } = useTranslation();

  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `delete-profile-button`,
  });

  const [
    getServiceConnections,
    { data: serviceConnections, refetch },
  ] = useLazyQuery<ServiceConnectionsRoot>(SERVICE_CONNECTIONS, {
    onCompleted: () => {
      setDataLoadState(loadedLoadState);
    },
    onError: (error: Error) => {
      setDataLoadState(notStartedLoadState);
      Sentry.captureException(error);
      createToast({ type: 'error' });
    },
  });

  useEffect(() => {
    const cb = () => {
      if (refetch) {
        const asyncRefetch = async () => {
          setDataLoadState(loadingLoadState);
          await refetch();
          setDataLoadState(loadedLoadState);
        };
        asyncRefetch();
      }
    };
    i18n.on('languageChanged', cb);
    return () => {
      i18n.off('languageChanged', cb);
    };
  });

  const loadServiceConnections = useCallback(() => {
    if (serviceConnections) {
      setDataLoadState(loadedLoadState);
    } else if (dataLoadState === notStartedLoadState) {
      getServiceConnections();
      setDataLoadState(loadingLoadState);
    }
  }, [
    getServiceConnections,
    setDataLoadState,
    dataLoadState,
    serviceConnections,
  ]);

  const onExpandingPanelChange = useCallback(
    isOpen => {
      if (isOpen) {
        loadServiceConnections();
      }
    },
    [loadServiceConnections]
  );

  const handleDeleteInstructions = () => {
    setDeleteInstructions(prevState => !prevState);
  };

  const handleConfirmationModal = () => {
    setDeleteConfirmationModal(prevState => !prevState);
    setFocusToRemoveButton();
  };

  const handleProfileDelete = async () => {
    setDeleteConfirmationModal(false);

    if (serviceConnections === undefined) {
      throw Error('Could not find services to delete');
    }

    deleteProfile();
  };
  const initiallyOpen = deleteProfileResult.loading;
  return (
    <React.Fragment>
      <ExpandingPanel
        title={t('deleteProfile.title')}
        initiallyOpen={initiallyOpen}
        scrollIntoViewOnMount={initiallyOpen}
        onChange={onExpandingPanelChange}
      >
        <p>{t('deleteProfile.explanation')}</p>
        {dataLoadState !== loadedLoadState ? (
          <div
            className={styles['loading-info']}
            aria-live="polite"
            aria-busy="true"
          >
            <LoadingSpinner small />
            <p>{t('deleteProfile.loadingServices')}</p>
          </div>
        ) : (
          <React.Fragment>
            <Checkbox
              onChange={handleDeleteInstructions}
              id="deleteInstructions"
              name="deleteInstructions"
              checked={deleteInstructions}
              label={t('deleteProfile.accept')}
            />

            <Button
              type="button"
              onClick={handleConfirmationModal}
              disabled={!deleteInstructions}
              className={styles.button}
              id={removeButtonId}
            >
              {t('deleteProfile.delete')}
            </Button>
          </React.Fragment>
        )}
      </ExpandingPanel>

      <ConfirmationModal
        isOpen={deleteConfirmationModal}
        onClose={handleConfirmationModal}
        onConfirm={handleProfileDelete}
        content={() => <ModalServicesContent data={serviceConnections} />}
        title={t('deleteProfileModal.title')}
        actionButtonText={t('deleteProfileModal.delete')}
      />
      <DeleteProfileError
        error={resultError}
        onClose={() => setResultError(undefined)}
      />
    </React.Fragment>
  );
}

export default DeleteProfile;
