import React from 'react';
import classNames from 'classnames';

import Explanation from '../explanation/Explanation';
import styles from './profileSection.module.css';

type Props = {
  children?: React.ReactNode;
  description?: string;
  titleButton?: React.ReactNode;
  title: string;
  titleVariant?: 'h2' | 'h3';
  hasVerifiedUserData?: boolean;
};

function ProfileSection({
  children,
  titleButton,
  titleVariant,
  description,
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
        {(title || description) && (
          <Explanation
            variant="flush"
            className={styles.profileSectionTitle}
            titleVariant={titleVariant}
            main={title}
            small={description}
          />
        )}
        <div className={styles.buttonContainer}>{titleButton}</div>
      </div>
      {children}
    </section>
  );
}

export default ProfileSection;
