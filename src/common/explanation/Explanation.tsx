import React from 'react';
import classNames from 'classnames';

import styles from './Explanation.module.css';

type Props = {
  main: string;
  small?: string;
  className?: string;
};

function Explanation(props: Props) {
  return (
    <div className={classNames(styles.container, props.className)}>
      <h1 className={styles.main}>{props.main}</h1>
      {props.small && <p className={styles.small}>{props.small}</p>}
    </div>
  );
}

export default Explanation;
