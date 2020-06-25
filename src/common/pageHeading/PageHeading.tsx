import React from 'react';
import classNames from 'classnames';

import { ReactComponent as UserIcon } from '../svg/User.svg';
import styles from './PageHeading.module.css';

type Props = {
  text: string;
  className?: string;
};

function PageHeading(props: Props) {
  return (
    <div className={classNames(styles.pageHeading, props.className)}>
      <UserIcon className={styles.userIcon} />
      <div className={styles.titleWrapper}>{props.text}</div>
    </div>
  );
}

export default PageHeading;
