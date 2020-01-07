import React, { useState } from 'react';

import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import Checkbox from '../../../common/checkbox/Checkbox';
import Button from '../../../common/button/Button';

function DeleteProfile() {
  const [deleteAccepted, setDeleteAccepted] = useState(false);
  const [deleteConfirmationDialog, setDeleteConfirmationDialog] = useState(
    false
  );

  const acceptDelete = () => {
    setDeleteAccepted(prevState => !prevState);
  };

  const deleteConfirmation = () => {
    setDeleteConfirmationDialog(prevState => !prevState);
  };

  return (
    <React.Fragment>
      <ExpandingPanel title="Haluatko poistaa Oma.helsinki tunnuksesi?">
        <p>
          Voit halutessasi poistaa kaikki tietosi, mutta se tarkoittaa myös
          käyttäjätilisi poistamista Lue lisää ohjeesta. Poistamalla Helsinki
          profiilisi menetätä myös kaikki yhdistettyihin palveluihin tallennetut
          tietosi, etkä voi enää kirjautua niihin.
        </p>

        <Checkbox
          onChange={acceptDelete}
          i18Key="profileInformation.deletionExplanation"
          useTransComponent
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          components={[<a href="/#"></a>]}
        />

        <Button
          type="button"
          onClick={deleteConfirmation}
          disabled={!deleteAccepted}
        >
          Poista Helsinki profiili
        </Button>
      </ExpandingPanel>

      <DeleteConfirmationModal
        isOpen={deleteConfirmationDialog}
        onClose={deleteConfirmation}
      />
    </React.Fragment>
  );
}

export default DeleteProfile;
