import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';

import styles from './Button.module.css';

type Props = PropsWithChildren<{
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}>;

function Button(props: Props) {
  const { type = 'button', className = '', disabled = false, ...rest } = props;
  const classes = classNames(className, styles.button);
  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {props.children}
    </button>
  );
}

export default Button;
