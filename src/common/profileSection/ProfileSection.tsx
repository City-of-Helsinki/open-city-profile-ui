import React from 'react';
import classNames from 'classnames';

import styles from './profileSection.module.css';
import Explanation from '../explanation/Explanation';

type Props = {
  children?: React.ReactNode;
  description?: string;
  titleButton?: React.ReactNode;
  title?: string;
  titleVariant?: 'h2' | 'h3';
  hasVerifiedUserData?: boolean;
};

function ProfileSection({
  children,
  description,
  titleButton,
  titleVariant,
  title,
  hasVerifiedUserData,
}: Props): React.ReactElement {
  return (
    <section
      className={classNames(
        styles.profileSection,
        hasVerifiedUserData && styles.verifiedData
      )}
    >
      <div className={styles.profileSectionTitleRow}>
        <Explanation
          variant="flush"
          className={styles.profileSectionTitle}
          titleVariant={titleVariant}
          main={title || ''}
          small={description}
        />
        {titleButton}
      </div>
      {children}
    </section>
  );
}

export default ProfileSection;
