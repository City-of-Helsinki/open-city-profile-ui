import React, { PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './Checkbox.module.css';

type Props = PropsWithChildren<{
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string | ReactNode;
  className?: string;
  name?: string;
  checked?: boolean;
}>;

function Checkbox(props: Props) {
  console.log('CHECKED', props.checked);
  return (
    <div className={classNames(styles.container, props.className)}>
      <input
        checked={props.checked}
        className={styles.checkbox}
        type="checkbox"
        onChange={props.onChange}
        name={props.name}
      />
      <label htmlFor={props.name} className={styles.label}>
        {props.label}
      </label>
    </div>
  );
}

export default Checkbox;
