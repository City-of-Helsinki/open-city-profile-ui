import React from 'react';
import classNames from 'classnames';

import styles from './Select.module.css';

type Option = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  id?: string;
  options: Option[];
  className?: string;
  labelText?: string;
  onChange?: () => void;
  value?: string;
};

function Select(props: Props) {
  return (
    <div className={classNames(styles.select, props.className)}>
      <label htmlFor={props.name} className={styles.label}>
        {props.labelText}
      </label>
      <select
        onChange={props.onChange}
        id={props.id}
        name={props.name}
        value={props.value}
      >
        {props.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
