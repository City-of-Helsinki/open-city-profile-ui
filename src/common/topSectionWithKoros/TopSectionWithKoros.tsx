import { Koros } from 'hds-react';
import React from 'react';
import classNames from 'classnames';

import commonContentStyles from '../cssHelpers/content.module.css';
import styles from './topSectionWithKoros.module.css';

type Props = {
  children: React.ReactNode | React.ReactNode[];
};

function TopSectionWithKoros(props: Props): React.ReactElement {
  return (
    <div className={styles['wrapper']}>
      <div
        className={classNames([
          commonContentStyles['common-content-area'],
          styles['content'],
        ])}
      >
        {props.children}
      </div>
      <Koros className={styles['koros']} />
    </div>
  );
}

export default TopSectionWithKoros;
