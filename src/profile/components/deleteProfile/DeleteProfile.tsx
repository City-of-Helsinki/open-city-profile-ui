import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';

import DeleteConfirmationModal from '../modals/deleteConfirmation/DeleteConfirmationModal';
import BerthErrorModal from '../modals/berthError/BerthErrorModal';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import Checkbox from '../../../common/checkbox/Checkbox';
import Button from '../../../common/button/Button';
import {
  DeleteProfile as DeleteProfileData,
  DeleteProfileVariables,
} from '../../graphql/__generated__/DeleteProfile';

const DELETE_PROFILE = loader('../../graphql/DeleteProfile.graphql');

type Props = {
  profileID: string;
};

function DeleteProfile(props: Props) {
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteInstructions, setDeleteInstructions] = useState(false);
  const [berthError, setBerthError] = useState(false);
  const { t } = useTranslation();
  const [deleteProfile] = useMutation<
    DeleteProfileData,
    DeleteProfileVariables
  >(DELETE_PROFILE, {
    refetchQueries: ['ProfileExistsQuery'],
  });

  const handleDeleteInstructions = () => {
    setDeleteInstructions(prevState => !prevState);
  };

  const handleConfirmationModal = () => {
    setDeleteConfirmationModal(prevState => !prevState);
  };

  const handleProfileDelete = () => {
    setDeleteConfirmationModal(false);

    const variables = {
      id: props.profileID,
    };

    deleteProfile({ variables })
      .then(result => {
        if (result.data) {
        }
      })
      .catch(err => {
        setBerthError(true);
      });
  };

  return (
    <React.Fragment>
      <ExpandingPanel title={t('deleteProfile.title')}>
        <p>{t('deleteProfile.explanation')}</p>

        <Checkbox
          onChange={handleDeleteInstructions}
          i18Key="deleteProfile.accept"
          useTransComponent
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          components={[<a href="/#"></a>]}
        />

        <Button
          type="button"
          onClick={handleConfirmationModal}
          disabled={!deleteInstructions}
        >
          {t('deleteProfile.delete')}
        </Button>
      </ExpandingPanel>

      <DeleteConfirmationModal
        isOpen={deleteConfirmationModal}
        onClose={handleConfirmationModal}
        onDelete={handleProfileDelete}
      />

      <BerthErrorModal
        isOpen={berthError}
        onClose={() => setBerthError(prevState => !prevState)}
      />
    </React.Fragment>
  );
}

export default DeleteProfile;
