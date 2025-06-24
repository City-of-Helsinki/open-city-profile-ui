import React from 'react';
import classNames from 'classnames';

import { ReactComponent as UserIcon } from '../svg/User.svg';
import styles from './PageHeading.module.css';

type Props = {
  text: string;
  className?: string;
  dataTestId?: string;
};

function PageHeading(props: Props): React.ReactElement {
  return (
    <div
      className={classNames(styles['page-heading'], props.className)}
      data-testid={props.dataTestId}
    >
      <UserIcon className={styles['user-icon']} aria-hidden={'true'} />
      <span>{props.text}</span>
    </div>
  );
}

export default PageHeading;
