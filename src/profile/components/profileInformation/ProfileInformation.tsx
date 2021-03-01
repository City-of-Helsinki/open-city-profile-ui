import React, { Fragment, useContext } from 'react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import ProfileInformationAccountManagementLink from './ProfileInformationAccountManagementLink';
import ProfileDataEditor from '../ProfileDataEditor/ProfileDataEditor';
import EditableBasicData from '../editableBasicData/EditableBasicData';
import EditableAdditionalInformation from '../editableAdditionalInformation/EditableAdditionalInformation';
import VerifiedPersonalInformation from '../verifiedPersonalInformation/VerifiedPersonalInformation';
import { ProfileContext } from '../context/ProfileContext';

function ProfileInformation(): React.ReactElement {
  const { data } = useContext(ProfileContext);
  return (
    <Fragment>
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
