import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Button, Checkbox } from 'hds-react';
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

  const { data, refetch } = useQuery<ServiceConnectionsRoot>(
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
  const initiallyOpen = deleteProfileResult.loading;
  const description = userHasServices
    ? t('deleteProfileModal.explanation')
    : t('deleteProfileModal.noServiceExplanation');

  return (
    <React.Fragment>
      <ExpandingPanel
        title={t('deleteProfile.title')}
        initiallyOpen={initiallyOpen}
        scrollIntoViewOnMount={initiallyOpen}
      >
        <p>{t('deleteProfile.explanation')}</p>

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
        >
          {t('deleteProfile.delete')}
        </Button>
      </ExpandingPanel>

      <ConfirmationModal
        isOpen={deleteConfirmationModal}
        onClose={handleConfirmationModal}
        onConfirm={handleProfileDelete}
        content={() => (
          <ModalServicesContent description={description} data={data} />
        )}
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
