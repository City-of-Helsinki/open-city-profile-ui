import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconFill } from 'hds-react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import getName from '../../helpers/getName';
import getAddress from '../../helpers/getAddress';
import { MyProfileQuery } from '../../../graphql/generatedTypes';
import ProfileSection from '../../../common/profileSection/ProfileSection';

type Props = {
  loading: boolean;
  data: MyProfileQuery;
  isEditing: boolean;
  setEditing: () => void;
};

function ProfileInformation(props: Props) {
  const { t, i18n } = useTranslation();
  const { isEditing, setEditing, loading, data } = props;

  return (
    <React.Fragment>
      <ProfileSection
        title={t('profileInformation.personalData')}
        description={t('profileInformation.visibility')}
        titleButton={
          !isEditing && (
            <Button
              variant="supplementary"
              onClick={setEditing}
              iconRight={<IconFill />}
              className={styles.edit}
            >
              {t('profileForm.edit')}
            </Button>
          )
        }
      >
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
                value={getAddress(data, i18n.languages[0])}
              />
              <LabeledValue
                label={t('profileInformation.phone')}
                value={data.myProfile?.primaryPhone?.phone}
              />
              <LabeledValue
                label={t('profileInformation.email')}
                value={data.myProfile?.primaryEmail?.email}
              />
              <LabeledValue
                label={t('profileForm.language')}
                value={t(`LANGUAGE_OPTIONS.${data.myProfile?.language}`)}
              />
            </>
          )}
        </div>
      </ProfileSection>
      <DownloadData />
      <DeleteProfile />
    </React.Fragment>
  );
}

export default ProfileInformation;
