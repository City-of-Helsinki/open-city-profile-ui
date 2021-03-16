import React from 'react';
import classNames from 'classnames';

import { ReactComponent as UserIcon } from '../svg/User.svg';
import styles from './PageHeading.module.css';

type Props = {
  text: string;
  className?: string;
};

function PageHeading(props: Props): React.ReactElement {
  return (
    <div className={classNames(styles.pageHeading, props.className)}>
      <UserIcon className={styles.userIcon} aria-hidden={'true'} />
      <h1>{props.text}</h1>
    </div>
  );
}

export default PageHeading;
