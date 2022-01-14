import React, { useCallback, useState } from 'react';
import { ApolloError, useLazyQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Button, Checkbox, LoadingSpinner, Notification } from 'hds-react';
import { useHistory } from 'react-router';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import {
  ServiceConnectionsQueryVariables,
  ServiceConnectionsRoot,
} from '../../../graphql/typings';
import styles from './deleteProfile.module.css';
import useDeleteProfile from '../../../gdprApi/useDeleteProfile';
import ModalServicesContent from '../modals/deleteProfileContent/DeleteProfileContent';
import { useFocusSetter } from '../../hooks/useFocusSetter';
import DeleteProfileError from '../modals/deleteProfileError/DeleteProfileError';
import createServiceConnectionsQueryVariables from '../../helpers/createServiceConnectionsQueryVariables';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

function DeleteProfile(): React.ReactElement {
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteInstructions, setDeleteInstructions] = useState(false);
  const notStartedLoadState = 'not-started';
  const loadingLoadState = 'loading';
  const loadedLoadState = 'loaded';
  const errorLoadState = 'error';
  const [dataLoadState, setDataLoadState] = useState<
    | typeof notStartedLoadState
    | typeof loadingLoadState
    | typeof loadedLoadState
    | typeof errorLoadState
  >(notStartedLoadState);
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

  const [getServiceConnections, { data: serviceConnections }] = useLazyQuery<
    ServiceConnectionsRoot,
    ServiceConnectionsQueryVariables
  >(SERVICE_CONNECTIONS, {
    variables: createServiceConnectionsQueryVariables(i18n.language),
    onCompleted: () => {
      setDataLoadState(loadedLoadState);
    },
    onError: (error: Error) => {
      setDataLoadState(errorLoadState);
      Sentry.captureException(error);
    },
  });

  const loadServiceConnections = useCallback(
    (reloadAfterError = false) => {
      if (dataLoadState !== loadedLoadState && serviceConnections) {
        setDataLoadState(loadedLoadState);
      } else if (dataLoadState === notStartedLoadState || reloadAfterError) {
        getServiceConnections();
        setDataLoadState(loadingLoadState);
      }
    },
    [getServiceConnections, setDataLoadState, dataLoadState, serviceConnections]
  );

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

  const ServiceConnectionLoadIndicator = () => (
    <div
      className={styles['loading-info']}
      aria-live="polite"
      aria-busy="true"
      data-testid="delete-profile-load-indicator"
    >
      <LoadingSpinner small />
      <p>{t('deleteProfile.loadingServices')}</p>
    </div>
  );
  const ServiceConnectionLoadError = () => (
    <Notification label={t('notification.defaultErrorText')} type={'error'}>
      <Button
        type="button"
        onClick={() => loadServiceConnections(true)}
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
      <ServiceConnectionLoadIndicator />
    );

  return (
    <React.Fragment>
      <ExpandingPanel
        title={t('deleteProfile.title')}
        initiallyOpen={initiallyOpen}
        scrollIntoViewOnMount={initiallyOpen}
        onChange={onExpandingPanelChange}
        dataTestId={'delete-profile'}
      >
        <p>{t('deleteProfile.explanation')}</p>
        {dataLoadState !== loadedLoadState ? (
          <LoadStateIndicator />
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
