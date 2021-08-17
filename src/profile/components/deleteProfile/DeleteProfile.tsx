import React, { useCallback, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
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
import checkBerthError from '../../helpers/checkBerthError';
import BerthErrorModal from '../modals/berthError/BerthErrorModal';
import ModalServicesContent from '../modals/deleteProfileContent/DeleteProfileContent';
import { useFocusSetter } from '../../hooks/useFocusSetter';

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
  const [berthError, setBerthError] = useState(false);
  const [deleteProfile, deleteProfileResult] = useDeleteProfile({
    onCompleted: returnedData => {
      if (returnedData) {
        trackEvent({ category: 'action', action: 'Delete profile' });
        history.push('/profile-deleted');
      }
    },
    onError: error => {
      if (checkBerthError(error.graphQLErrors)) {
        setBerthError(true);
      } else {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      }
    },
  });

  const { t, i18n } = useTranslation();

  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `delete-profile-button`,
  });

  const [getServiceConnections, { data, refetch }] = useLazyQuery<
    ServiceConnectionsRoot
  >(SERVICE_CONNECTIONS, {
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
    if (dataLoadState === notStartedLoadState) {
      getServiceConnections();
      setDataLoadState(loadingLoadState);
    }
  }, [getServiceConnections, setDataLoadState, dataLoadState]);

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

    if (data === undefined) {
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
        content={() => <ModalServicesContent data={data} />}
        title={t('deleteProfileModal.title')}
        actionButtonText={t('deleteProfileModal.delete')}
      />
      <BerthErrorModal
        isOpen={berthError}
        onClose={() => setBerthError(prevState => !prevState)}
      />
    </React.Fragment>
  );
}

export default DeleteProfile;
