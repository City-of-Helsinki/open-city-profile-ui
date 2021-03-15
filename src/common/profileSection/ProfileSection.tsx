import React from 'react';
import classNames from 'classnames';

import Explanation from '../explanation/Explanation';
import styles from './profileSection.module.css';

type Props = {
  children?: React.ReactNode;
  description?: string;
  title?: string;
  titleVariant?: 'h2' | 'h3';
  hasVerifiedUserData?: boolean;
};

function ProfileSection({
  children,
  titleVariant,
  description,
  title,
  hasVerifiedUserData,
}: Props): React.ReactElement {
  const hasTitleRowContent = !!(title || description);
  return (
    <section
      className={classNames(
        styles.profileSection,
        hasVerifiedUserData && styles.verifiedData
      )}
    >
      {hasTitleRowContent && (
        <div className={styles.profileSectionTitleRow}>
          {(title || description) && (
            <Explanation
              variant="flush"
              className={styles.profileSectionTitle}
              titleVariant={titleVariant}
              main={title || ''}
              small={description}
            />
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default ProfileSection;
