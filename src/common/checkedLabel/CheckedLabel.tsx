import React from 'react';
import { IconCheck } from 'hds-react';

import styles from './CheckedLabel.module.css';

type Props = {
  className: string;
  value: string;
};

function CheckedLabel(props: Props): React.ReactElement {
  return (
    <span className={`${styles['checked-label']} ${props.className}`}>
      <IconCheck className={styles['icon']} aria-hidden />
      {props.value}
    </span>
  );
}

export default CheckedLabel;
