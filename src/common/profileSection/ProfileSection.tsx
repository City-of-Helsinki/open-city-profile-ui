import React from 'react';
import classNames from 'classnames';

import styles from './profileSection.module.css';

type Props = {
  children?: React.ReactNode;
};

function ProfileSection({ children }: Props): React.ReactElement {
  return (
    <section className={classNames(styles['profile-section'])}>
      {children}
    </section>
  );
}

export default ProfileSection;
