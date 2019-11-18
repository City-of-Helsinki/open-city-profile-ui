import React from 'react';

import { ReactComponent as UserIcon } from '../svg/User.svg';
import styles from './PageHeading.module.css';

type Props = {
  text: string;
};

function PageHeading(props: Props) {
  return (
    <div className={styles.pageHeading}>
      <UserIcon />
      <h1>{props.text}</h1>
    </div>
  );
}

export default PageHeading;
