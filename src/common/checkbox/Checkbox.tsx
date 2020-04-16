import React, { PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './Checkbox.module.css';

type Props = PropsWithChildren<{
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string | ReactNode;
  className?: string;
  name?: string;
  id?: string;
  checked?: boolean;
}>;

function Checkbox(props: Props) {
  return (
    <div className={classNames(styles.container, props.className)}>
      <input
        checked={props.checked}
        className={styles.checkbox}
        type="checkbox"
        onChange={props.onChange}
        name={props.name}
        id={props.id}
      />
      <label htmlFor={props.name} className={styles.label}>
        {props.label}
      </label>
    </div>
  );
}

export default Checkbox;
