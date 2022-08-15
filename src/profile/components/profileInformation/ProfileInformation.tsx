import React, { Fragment, useContext } from 'react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import AuthenticationProviderInformation from './AuthenticationProviderInformation';
import { ProfileContext } from '../../context/ProfileContext';
import BasicData from '../basicData/BasicData';
import EmailEditor from '../emailEditor/EmailEditor';
import MultiItemEditor from '../multiItemEditor/MultiItemEditor';
import AdditionalInformation from '../additionalInformation/AdditionalInformation';
import VerifiedPersonalInformation from '../verifiedPersonalInformation/VerifiedPersonalInformation';
import getVerifiedPersonalInformation from '../../helpers/getVerifiedPersonalInformation';

function ProfileInformation(): React.ReactElement {
  const { data } = useContext(ProfileContext);
  const hasVerifiedData = !!getVerifiedPersonalInformation(data);
  const UserDataComponent = hasVerifiedData
    ? VerifiedPersonalInformation
    : BasicData;
  return (
    <Fragment>
      {data && (
        <Fragment>
          <UserDataComponent />
          <EmailEditor />
          <MultiItemEditor dataType="addresses" />
          <MultiItemEditor dataType="phones" />
          <AdditionalInformation />
        </Fragment>
      )}
      <div className={styles['box-grid']}>
        <AuthenticationProviderInformation />
        <DownloadData />
        <DeleteProfile />
      </div>
    </Fragment>
  );
}

export default ProfileInformation;
