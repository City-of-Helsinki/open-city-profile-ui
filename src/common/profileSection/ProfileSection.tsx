import React from 'react';
import classNames from 'classnames';

import styles from './profileSection.module.css';

type Props = {
  children?: React.ReactNode;
  hasVerifiedUserData?: boolean;
};

function ProfileSection({
  children,
  hasVerifiedUserData,
}: Props): React.ReactElement {
  return (
    <section
      className={classNames(
        styles['profile-section'],
        hasVerifiedUserData && styles['verified-data']
      )}
    >
      {children}
    </section>
  );
}

export default ProfileSection;
