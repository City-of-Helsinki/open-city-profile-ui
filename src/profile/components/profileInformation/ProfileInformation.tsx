import React, { Fragment, useContext } from 'react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import ProfileInformationAccountManagementLink from './ProfileInformationAccountManagementLink';
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
      <ProfileInformationAccountManagementLink />
      <DownloadData />
      <DeleteProfile />
    </Fragment>
  );
}

export default ProfileInformation;
