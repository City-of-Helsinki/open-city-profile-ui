import React, { Fragment, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import ProfileInformationAccountManagementLink from './AuthenticationProviderInformation';
import { ProfileContext } from '../../context/ProfileContext';
import BasicData from '../basicData/BasicData';
import EmailEditor from '../emailEditor/EmailEditor';
import MultiItemEditor from '../multiItemEditor/MultiItemEditor';
import AdditionalInformation from '../additionalInformation/AdditionalInformation';
import VerifiedPersonalInformation from '../verifiedPersonalInformation/VerifiedPersonalInformation';
import getVerifiedPersonalInformation from '../../helpers/getVerifiedPersonalInformation';
import Explanation from '../../../common/explanation/Explanation';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';

function ProfileInformation(): React.ReactElement {
  const { data } = useContext(ProfileContext);
  const { t } = useTranslation();
  const hasVerifiedData = !!getVerifiedPersonalInformation(data);
  const UserDataComponent = hasVerifiedData
    ? VerifiedPersonalInformation
    : BasicData;
  return (
    <div className={classNames([commonContentStyles['content']])}>
      <div className={classNames([commonContentStyles['common-content-area']])}>
        <Explanation
          heading={t('profileInformation.title')}
          text={t('profileInformation.description')}
          dataTestId="profile-information-explanation"
        />
        {data && (
          <Fragment>
            <UserDataComponent />
            <MultiItemEditor dataType="addresses" />
            <MultiItemEditor dataType="phones" />
            <EmailEditor />
            <AdditionalInformation />
          </Fragment>
        )}
        <ProfileInformationAccountManagementLink />
      </div>
      <div
        className={classNames([
          commonContentStyles['content'],
          commonContentStyles['common-content-area-dark-bg'],
          commonContentStyles['common-bottom-padding'],
        ])}
      >
        <div
          className={classNames([commonContentStyles['common-content-area']])}
        >
          <DownloadData />
          <DeleteProfile />
        </div>
      </div>
    </div>
  );
}

export default ProfileInformation;
