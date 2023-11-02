import React, { Fragment, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useApiTokens } from 'hds-react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import AuthenticationProviderInformation from './AuthenticationProviderInformation';
import { ProfileContext } from '../../context/ProfileContext';
import VerifiedPersonalInformation from '../verifiedPersonalInformation/VerifiedPersonalInformation';
import getVerifiedPersonalInformation from '../../helpers/getVerifiedPersonalInformation';
import Explanation from '../../../common/explanation/Explanation';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import EditableProfileData from '../editableProfileData/EditableProfileData';

function ProfileInformation(): React.ReactElement {
  console.log('ProfileInformation');
  const { data } = useContext(ProfileContext);
  const { t } = useTranslation();
  const { getStoredApiTokens } = useApiTokens();
  console.log('useApiTokens', getStoredApiTokens());
  const hasVerifiedData = !!getVerifiedPersonalInformation(data);
  return (
    <div className={classNames([commonContentStyles['content']])}>
      <div className={classNames([commonContentStyles['common-content-area']])}>
        <Explanation
          heading={t('profileInformation.title')}
          text={
            <Trans
              i18nKey="profileInformation.description"
              components={{
                linkToServices: <Link to={'/connected-services'}>{''}</Link>,
                linkToServicesText: t('nav.services'),
              }}
            />
          }
          dataTestId="profile-information-explanation"
          useHeadingHeroStyle
        />
        {data && (
          <Fragment>
            {hasVerifiedData && <VerifiedPersonalInformation />}
            <EditableProfileData />
          </Fragment>
        )}
        <AuthenticationProviderInformation />
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
