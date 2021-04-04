import React, { Fragment, useContext, useState } from 'react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import BerthErrorModal from '../modals/berthError/BerthErrorModal';
import ProfileInformationAccountManagementLink from './ProfileInformationAccountManagementLink';
import { ProfileContext } from '../../context/ProfileContext';

function ProfileInformation(): React.ReactElement {
  const [berthError, setBerthError] = useState(false);
  const { data } = useContext(ProfileContext);
  return (
    <Fragment>
      {data && (
        <Fragment>
          <div>COMPONENT PLACEHOLDER</div>
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
