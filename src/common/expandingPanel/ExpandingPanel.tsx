import React, { useState, PropsWithChildren } from 'react';
import classNames from 'classnames';
import IconAngleRight from 'hds-react/lib/icons/IconAngleRight';

import styles from './ExpandingPanel.module.css';

type Props = PropsWithChildren<{
  title?: string;
}>;

function ExpandingPanel(props: Props) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanding = () => setExpanded(prevState => !prevState);
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

  return (
    <div className={styles.container}>
      <div
        className={styles.title}
        onClick={toggleExpanding}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded ? 'true' : 'false'}
      >
        <h2>{props.title}</h2>
        <IconAngleRight
          className={expanded ? styles.iconUp : styles.iconDown}
        />
      </div>
      <div
        className={classNames(
          styles.content,
          expanded ? styles.open : styles.closed
        )}
      >
        {props.children}
      </div>
    </div>
  );
}

export default ExpandingPanel;
