import React, { Fragment, useContext } from 'react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import ProfileInformationAccountManagementLink from './ProfileInformationAccountManagementLink';
import EditableBasicData from '../editableBasicData/EditableBasicData';
import EditableAdditionalInformation from '../editableAdditionalInformation/EditableAdditionalInformation';
import VerifiedPersonalInformation from '../verifiedPersonalInformation/VerifiedPersonalInformation';
import { ProfileContext } from '../context/ProfileContext';
import getVerifiedPersonalInformation from '../../helpers/getVerifiedPersonalInformation';

function ProfileInformation(): React.ReactElement {
  const { data } = useContext(ProfileContext);
  const hasVerifiedData = !!getVerifiedPersonalInformation(data);
  const UserDataComponent = hasVerifiedData
    ? VerifiedPersonalInformation
    : EditableBasicData;
  return (
    <Fragment>
      {data && (
        <Fragment>
          <UserDataComponent />
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
