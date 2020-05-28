import React from 'react';
import classNames from 'classnames';

import styles from './ToggleSwitch.module.css';

type Props = {
  checked?: boolean;
};
function ToggleSwitch(props: Props) {
  return (
    <div className={styles.switch}>
      <input type="checkbox" checked={props.checked} />
      <span className={classNames(styles.slider, styles.round)} />
    </div>
  );
}

export default ToggleSwitch;
