import React, { Fragment, useContext, useState } from 'react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import BerthErrorModal from '../modals/berthError/BerthErrorModal';
import ProfileInformationAccountManagementLink from './ProfileInformationAccountManagementLink';
import { ProfileContext } from '../../context/ProfileContext';
import BasicData from '../basicData/BasicData';

function ProfileInformation(): React.ReactElement {
  const [berthError, setBerthError] = useState(false);
  const { data } = useContext(ProfileContext);
  return (
    <Fragment>
      {data && (
        <Fragment>
          <BasicData />
        </Fragment>
      )}
      <div className={styles.boxGrid}>
        <ProfileInformationAccountManagementLink />
        <DownloadData />
        <DeleteProfile />
      </div>
      <BerthErrorModal
        isOpen={berthError}
        onClose={() => setBerthError(prevState => !prevState)}
      />
    </Fragment>
  );
}

export default ProfileInformation;
