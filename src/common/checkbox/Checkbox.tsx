import React, { PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './Checkbox.module.css';

type Props = PropsWithChildren<{
  onChange: () => void;
  label?: string | ReactNode;
  className?: string;
}>;

function Checkbox(props: Props) {
  return (
    <div className={classNames(styles.container, props.className)}>
      <input
        className={styles.checkbox}
        type="checkbox"
        onChange={props.onChange}
      />
      <span className={styles.label}>{props.label}</span>
    </div>
  );
}

export default Checkbox;
