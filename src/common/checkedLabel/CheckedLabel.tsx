import React from 'react';

import styles from './CheckedLabel.module.css';

type Props = {
  className: string;
  value: string;
};

function CheckedLabel(props: Props) {
  return (
    <span className={`${styles.checkedLabel} ${props.className}`}>
      {props.value}
    </span>
  );
}

export default CheckedLabel;
