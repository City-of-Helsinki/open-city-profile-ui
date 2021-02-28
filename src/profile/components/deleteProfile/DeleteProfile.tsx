import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Checkbox } from 'hds-react';
import { useHistory } from 'react-router';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import Button from '../../../common/button/Button';
import { ServiceConnectionsQuery } from '../../../graphql/generatedTypes';
import useToast from '../../../toast/useToast';
import styles from './deleteProfile.module.css';
import useDeleteProfile from '../../../gdprApi/useDeleteProfile';
import checkBerthError from '../../helpers/checkBerthError';
import BerthErrorModal from '../modals/berthError/BerthErrorModal';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

function DeleteProfile(): React.ReactElement {
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteInstructions, setDeleteInstructions] = useState(false);
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

  const { data, refetch } = useQuery<ServiceConnectionsQuery>(
    SERVICE_CONNECTIONS,
    {
      onError: (error: Error) => {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      },
    }
  );

  useEffect(() => {
    const cb = () => refetch();
    i18n.on('languageChanged', cb);
    return () => {
      i18n.off('languageChanged', cb);
    };
  });

  const handleDeleteInstructions = () => {
    setDeleteInstructions(prevState => !prevState);
  };

  const handleConfirmationModal = () => {
    setDeleteConfirmationModal(prevState => !prevState);
  };

  const handleProfileDelete = async () => {
    setDeleteConfirmationModal(false);

    if (data === undefined) {
      throw Error('Could not find services to delete');
    }

    deleteProfile();
  };
  const userHasServices =
    data?.myProfile?.serviceConnections?.edges?.length !== 0;
  const isOpenByDefault = deleteProfileResult.loading;

  return (
    <React.Fragment>
      <ExpandingPanel
        title={t('deleteProfile.title')}
        defaultExpanded={isOpenByDefault}
        scrollIntoViewOnMount={isOpenByDefault}
      >
        <p>{t('deleteProfile.explanation')}</p>

        <Checkbox
          onChange={handleDeleteInstructions}
          id="deleteInstructions"
          name="deleteInstructions"
          checked={deleteInstructions}
          labelText={t('deleteProfile.accept')}
        />

        <Button
          type="button"
          onClick={handleConfirmationModal}
          disabled={!deleteInstructions}
          className={styles.button}
        >
          {t('deleteProfile.delete')}
        </Button>
      </ExpandingPanel>

      <ConfirmationModal
        isOpen={deleteConfirmationModal}
        onClose={handleConfirmationModal}
        onConfirm={handleProfileDelete}
        services={data}
        modalTitle={t('deleteProfileModal.title')}
        modalText={
          userHasServices
            ? t('deleteProfileModal.explanation')
            : t('deleteProfileModal.noServiceExplanation')
        }
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
