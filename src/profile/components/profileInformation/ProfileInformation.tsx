import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconPenLine } from 'hds-react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import getName from '../../helpers/getName';
import getAddress from '../../helpers/getAddress';
import {
  MyProfileQuery,
  MyProfileQuery_myProfile_emails_edges_node as Email,
} from '../../../graphql/generatedTypes';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import getEmailsFromNode from '../../helpers/getEmailsFromNode';

type Props = {
  loading: boolean;
  data: MyProfileQuery;
  isEditing: boolean;
  setEditing: () => void;
};

function ProfileInformation(props: Props) {
  const { t, i18n } = useTranslation();
  const { isEditing, setEditing, loading, data } = props;

  const emails = getEmailsFromNode(data);
  return (
    <Fragment>
      <ProfileSection
        title={t('profileInformation.personalData')}
        description={t('profileInformation.visibility')}
        titleButton={
          !isEditing && (
            <Button
              variant="supplementary"
              onClick={setEditing}
              iconRight={<IconPenLine />}
              className={styles.edit}
            >
              {t('profileForm.edit')}
            </Button>
          )
        }
      >
        {loading && t('loading')}
        {data && !isEditing && (
          <Fragment>
            <div className={styles.storedInformation}>
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
            </div>
            {emails.length > 0 && (
              <Fragment>
                <h2 className={styles.title}>
                  {t('profileForm.additionalInfo')}
                </h2>
                <div className={styles.storedInformation}>
                  {emails.map((email: Email, index: number) => (
                    <LabeledValue
                      key={index}
                      label={t('profileInformation.email')}
                      value={email.email}
                    />
                  ))}
                </div>
              </Fragment>
            )}
          </Fragment>
        )}
      </ProfileSection>
      <DownloadData />
      <DeleteProfile />
    </Fragment>
  );
}

export default ProfileInformation;
