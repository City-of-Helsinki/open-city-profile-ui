import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LabeledValue from '../../../common/labeledValue/LabeledValue';
import styles from './ProfileInformation.module.css';
import Explanation from '../../../common/explanation/Explanation';
import getName from '../../helpers/getName';
import getAddress from '../../helpers/getAddress';
import { MyProfileQuery } from '../../graphql/__generated__/MyProfileQuery';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import Button from '../../../common/button/Button';
import Checkbox from '../../../common/checkbox/Checkbox';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';

type Props = {
  loading: boolean;
  data: MyProfileQuery;
  isEditing: boolean;
  setEditing: () => void;
};

function ProfileInformation(props: Props) {
  const [deleteAccepted, setDeleteAccepted] = useState(false);
  const [deleteConfirmationDialog, setDeleteConfirmationDialog] = useState(
    false
  );
  const { t } = useTranslation();
  const { isEditing, setEditing, loading, data } = props;

  const acceptDelete = () => {
    setDeleteAccepted(prevState => !prevState);
  };

  const deleteConfirmation = () => {
    setDeleteConfirmationDialog(prevState => !prevState);
  };

  return (
    <React.Fragment>
      <section className={styles.personalInformation}>
        <div className={styles.personalInformationTitleRow}>
          <Explanation
            main={t('profileInformation.personalData')}
            small={t('profileInformation.visibility')}
          />
          {!isEditing && (
            <button onClick={setEditing} className={styles.edit}>
              {t('profileForm.edit').toUpperCase()}
            </button>
          )}
        </div>
        <div className={styles.storedInformation}>
          {loading && t('loading')}
          {data && !isEditing && (
            <>
              <LabeledValue
                label={t('profileInformation.name')}
                value={getName(data)}
              />
              <LabeledValue
                label={t('profileInformation.address')}
                value={getAddress(data)}
              />
              <LabeledValue
                label={t('profileInformation.email')}
                value={data.myProfile?.primaryEmail?.email}
              />
              <LabeledValue
                label={t('profileInformation.phone')}
                value={data.myProfile?.primaryPhone?.phone}
              />
            </>
          )}
        </div>
      </section>
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

export default ProfileInformation;
