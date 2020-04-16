import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation, Trans } from 'react-i18next';
import { useHistory } from 'react-router';
import * as Sentry from '@sentry/browser';

import checkBerthError from '../../helpers/checkBerthError';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import NotificationComponent from '../../../common/notification/NotificationComponent';
import BerthErrorModal from '../modals/berthError/BerthErrorModal';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import Checkbox from '../../../common/checkbox/Checkbox';
import Button from '../../../common/button/Button';
import {
  DeleteMyProfile as DeleteMyProfileData,
  DeleteMyProfileVariables,
  ServiceConnectionsQuery,
} from '../../../graphql/generatedTypes';

const DELETE_PROFILE = loader('../../graphql/DeleteMyProfile.graphql');
const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

type Props = {};

function DeleteProfile(props: Props) {
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteInstructions, setDeleteInstructions] = useState(false);
  const [berthError, setBerthError] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const history = useHistory();
  const { t } = useTranslation();
  const { data } = useQuery<ServiceConnectionsQuery>(SERVICE_CONNECTIONS, {
    onError: (error: Error) => {
      Sentry.captureException(error);
      setShowNotification(true);
    },
  });
  const [deleteProfile] = useMutation<
    DeleteMyProfileData,
    DeleteMyProfileVariables
  >(DELETE_PROFILE);

  const handleDeleteInstructions = () => {
    setDeleteInstructions(prevState => !prevState);
  };

  const handleConfirmationModal = () => {
    setDeleteConfirmationModal(prevState => !prevState);
  };

  const handleProfileDelete = () => {
    setDeleteConfirmationModal(false);

    const variables = {
      input: {},
    };

    deleteProfile({ variables })
      .then(result => {
        if (result.data) history.push('/profile-deleted');
      })
      .catch(error => {
        if (checkBerthError(error.graphQLErrors)) {
          setBerthError(true);
        } else {
          Sentry.captureException(error);
          setShowNotification(true);
        }
      });
  };
  const userHasServices =
    data?.myProfile?.serviceConnections?.edges?.length !== 0;
  return (
    <React.Fragment>
      <ExpandingPanel title={t('deleteProfile.title')}>
        <p>{t('deleteProfile.explanation')}</p>

        <Checkbox
          onChange={handleDeleteInstructions}
          name="deleteInstructions"
          label={
            <Trans
              i18nKey="deleteProfile.accept"
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              components={[<a href="/#"></a>]}
            />
          }
        />

        <Button
          type="button"
          onClick={handleConfirmationModal}
          disabled={!deleteInstructions}
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

      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </React.Fragment>
  );
}

export default DeleteProfile;
