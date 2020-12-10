import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './AccessibilityShortcuts.module.css';

interface Props {
  mainContentId: string;
}

function AccessibilityShortcuts({ mainContentId }: Props): React.ReactElement {
  const mainContentHref = `#${mainContentId}`;
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <a
        className={classNames(styles.srOnlyFocusable, styles.accessibilityLink)}
        href={mainContentHref}
      >
        {t('skipToContent')}
      </a>
    </div>
  );
}

export default AccessibilityShortcuts;
