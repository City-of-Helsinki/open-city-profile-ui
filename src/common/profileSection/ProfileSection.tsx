import React from 'react';

import styles from './profileSection.module.css';
import Explanation from '../explanation/Explanation';

type Props = {
  children?: React.ReactNode;
  description?: string;
  titleButton?: React.ReactNode;
  title: string;
  titleVariant?: 'h2' | 'h3';
};

function ProfileSection({
  children,
  description,
  titleButton,
  titleVariant,
  title,
}: Props) {
  return (
    <section className={styles.profileSection}>
      <div className={styles.profileSectionTitleRow}>
        <Explanation
          variant="flush"
          className={styles.profileSectionTitle}
          titleVariant={titleVariant}
          main={title}
          small={description}
        />
        {titleButton}
      </div>
      {children}
    </section>
  );
}

export default ProfileSection;
