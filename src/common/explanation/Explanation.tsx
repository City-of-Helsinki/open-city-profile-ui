import React from 'react';
import classNames from 'classnames';

import styles from './Explanation.module.css';

type Props = {
  main: string;
  small?: string;
  className?: string;
  variant?: 'margin' | 'flush';
};

function Explanation({ className, main, small, variant = 'margin' }: Props) {
  return (
    <div
      className={classNames(
        styles.container,
        {
          [styles.margin]: variant === 'margin',
          [styles.flush]: variant === 'flush',
        },
        className
      )}
    >
      <h1 className={styles.main}>{main}</h1>
      {small && <p className={styles.small}>{small}</p>}
    </div>
  );
}

export default Explanation;
