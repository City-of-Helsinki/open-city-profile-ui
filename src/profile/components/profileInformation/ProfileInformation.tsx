import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import { MyProfileQuery } from '../../../graphql/generatedTypes';
import ProfileInformationAccountManagementLink from './ProfileInformationAccountManagementLink';
import ProfileDataEditor from '../ProfileDataEditor/ProfileDataEditor';
import EditableBasicData from '../editableBasicData/EditableBasicData';
import EditableAdditionalInformation from '../editableAdditionalInformation/EditableAdditionalInformation';
import VerifiedPersonalInformation from '../verifiedPersonalInformation/VerifiedPersonalInformation';

type Props = {
  loading: boolean;
  data: MyProfileQuery;
};

function ProfileInformation(props: Props): React.ReactElement {
  const { t } = useTranslation();
  const { loading, data } = props;
  return (
    <Fragment>
      {loading && !data && t('loading')}
      {data && (
        <Fragment>
          <VerifiedPersonalInformation />
          <EditableBasicData />
          <ProfileDataEditor dataType="addresses" />
          <ProfileDataEditor dataType="phones" />
          <ProfileDataEditor dataType="emails" />
          <EditableAdditionalInformation />
        </Fragment>
      )}
      <div className={styles.boxGrid}>
        <ProfileInformationAccountManagementLink />
        <DownloadData />
        <DeleteProfile />
      </div>
    </Fragment>
  );
}

export default ProfileInformation;
