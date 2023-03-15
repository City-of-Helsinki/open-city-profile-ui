import React from 'react';
import { Button, ButtonProps } from 'hds-react';
import classNames from 'classnames';

import styles from './StyledButton.module.css';

type Variant = ButtonProps['variant'] | 'transparent';

function StyledButton(
  props: Omit<ButtonProps, 'variant'> & { variant?: Variant }
): React.ReactElement {
  const { className, variant } = props;
  const classList = className ? [className] : [];
  if (variant === 'transparent') {
    classList.push(styles['hel-fi-styled-button-transparent']);
  } else if (variant === 'secondary') {
    classList.push(styles['hel-fi-styled-button-secondary']);
  } else {
    classList.push(styles['hel-fi-styled-button-primary']);
  }
  const buttonProps = {
    ...props,
    variant: variant === 'transparent' ? 'supplementary' : variant,
  };
  return (
    <Button
      {...(buttonProps as ButtonProps)}
      className={classNames(classList)}
    />
  );
}

export default StyledButton;
