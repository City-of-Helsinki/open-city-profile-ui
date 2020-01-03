import React, { useState, PropsWithChildren } from 'react';
import classNames from 'classnames';

import styles from './ExpandingPanel.module.css';

type Props = PropsWithChildren<{
  title?: string;
}>;

function ExpandingPanel(props: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanding = () => setExpanded(prevState => !prevState);

  return (
    <div className={styles.container}>
      <div className={styles.title} onClick={toggleExpanding}>
        <h2>{props.title}</h2>
        <span>D</span>
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
