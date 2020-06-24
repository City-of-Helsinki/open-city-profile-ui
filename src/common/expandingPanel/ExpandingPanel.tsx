import React, { useState, PropsWithChildren, useRef } from 'react';
import { IconAngleRight } from 'hds-react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './ExpandingPanel.module.css';

type Props = PropsWithChildren<{
  title?: string;
  showInformationText?: boolean;
  defaultExpanded?: boolean;
  scrollIntoViewOnMount?: boolean;
}>;

function ExpandingPanel({
  children,
  defaultExpanded,
  showInformationText,
  scrollIntoViewOnMount,
  title,
}: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const toggleExpanding = () => setExpanded(prevState => !prevState);
  const { t } = useTranslation();
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (
      event.key === ' ' ||
      event.key === 'Enter' ||
      event.key === 'Spacebar'
    ) {
      event.preventDefault();
      toggleExpanding();
    }
  };

  const handleContainerRef = (ref: HTMLDivElement) => {
    // If ref is not saved yet we are about in the first render.
    // In that case we can scroll this element into view.
    if (!container.current && scrollIntoViewOnMount && ref) {
      ref.scrollIntoView();
    }

    container.current = ref;
  };

  return (
    <div className={styles.container} ref={handleContainerRef}>
      <div
        className={styles.title}
        onClick={toggleExpanding}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded ? 'true' : 'false'}
      >
        <h2>{title}</h2>
        <div className={styles.rightSideInformation}>
          {showInformationText && (
            <p className={styles.showInformation}>
              {expanded
                ? t('expandingPanel.hideInformation')
                : t('expandingPanel.showInformation')}
            </p>
          )}
          <IconAngleRight
            className={classNames(
              styles.icon,
              expanded ? styles.iconUp : styles.iconDown
            )}
          />
        </div>
      </div>
      {expanded && <div className={styles.content}>{children}</div>}
    </div>
  );
}

export default ExpandingPanel;
