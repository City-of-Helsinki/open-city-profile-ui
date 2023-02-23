import React from 'react';
import classNames from 'classnames';

import styles from './profileSection.module.css';
import commonStyles from '../cssHelpers/common.module.css';

type Props = {
  children?: React.ReactNode;
  bottomBorder?: boolean;
};

function ProfileSection({ children, bottomBorder }: Props): React.ReactElement {
  return (
    <section
      className={classNames(
        commonStyles['content-box'],
        styles['profile-section'],
        bottomBorder && commonStyles['bottom-border']
      )}
    >
      {children}
    </section>
  );
}

export default ProfileSection;
