import React from 'react';
import classNames from 'classnames';

import styles from './profileSection.module.css';
import commonStyles from '../cssHelpers/common.module.css';

type Props = {
  children?: React.ReactNode;
};

function ProfileSection({ children }: Props): React.ReactElement {
  return (
    <section
      className={classNames(
        commonStyles['content-box'],
        styles['profile-section']
      )}
    >
      {children}
    </section>
  );
}

export default ProfileSection;
