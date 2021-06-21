import React from 'react';
import classNames from 'classnames';

import styles from './profileSection.module.css';
import Explanation from '../explanation/Explanation';

type Props = {
  children?: React.ReactNode;
  description?: string;
  title?: string;
  titleVariant?: 'h2' | 'h3';
  hasVerifiedUserData?: boolean;
};

function ProfileSection({
  children,
  description,
  titleVariant,
  title,
  hasVerifiedUserData,
}: Props): React.ReactElement {
  return (
    <section
      className={classNames(
        styles['profile-section'],
        hasVerifiedUserData && styles['verified-data']
      )}
    >
      <div className={styles['profile-section-title-row']}>
        <Explanation
          variant="flush"
          className={styles['profile-section-title']}
          titleVariant={titleVariant}
          main={title || ''}
          small={description}
        />
      </div>
      {children}
    </section>
  );
}

export default ProfileSection;
