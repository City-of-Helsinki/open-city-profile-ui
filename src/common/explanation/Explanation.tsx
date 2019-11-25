import React from 'react';

import styles from './Explanation.module.css';

type Props = {
  main: string;
  small: string;
};

function Explanation(props: Props) {
  return (
    <div>
      <h2 className={styles.main}>{props.main}</h2>
      <p className={styles.small}>{props.small}</p>
    </div>
  );
}

export default Explanation;
