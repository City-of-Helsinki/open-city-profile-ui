import React from 'react';
import { Button, ButtonProps } from 'hds-react';
import classNames from 'classnames';

import styles from './StyledButton.module.css';

function StyledButton(props: ButtonProps): React.ReactElement {
  const classList = props?.className ? [props?.className] : [];
  if (props.variant === 'secondary') {
    classList.push(styles['hel-fi-styled-button-secondary']);
  } else {
    classList.push(styles['hel-fi-styled-button-primary']);
  }
  return <Button {...props} className={classNames(classList)} />;
}

export default StyledButton;
