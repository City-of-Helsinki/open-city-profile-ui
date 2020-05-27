import React, { PropsWithChildren, useState } from 'react';
import classNames from 'classnames';

import ToggleSwitch from '../toggleSwitch/ToggleSwitch';
import styles from './TogglePanel.module.css';

type Props = PropsWithChildren<{
  title?: string | null;
  informationText?: string;
}>;

function TogglePanel(props: Props) {
  const [toggled, setToggled] = useState<boolean>(false);
  const togglePanel = () => setToggled(prevState => !prevState);
  return (
    <div className={styles.container}>
      <div
        className={styles.title}
        onClick={togglePanel}
        tabIndex={0}
        role="button"
        aria-expanded={toggled ? 'true' : 'false'}
      >
        <h2>{props.title}</h2>
        <div className={styles.rightSideInformation}>
          {props.informationText && toggled && (
            <p className={styles.informationText}>{props.informationText}</p>
          )}
          <ToggleSwitch checked={toggled} />
        </div>
      </div>
      <div
        className={classNames(
          styles.content,
          toggled ? styles.open : styles.closed
        )}
      >
        {props.children}
      </div>
    </div>
  );
}

export default TogglePanel;
