import React from 'react';
import classNames from 'classnames';

import styles from './Explanation.module.css';

type Props = {
  main: string;
  small?: string;
  className?: string;
  // The explanation content can be with or without a wrapping element.
  // When it is not wrapped, it needs to have its own margin on small
  // screens. When it is wrapped, the containing element usually has a
  // padding that takes care of the whitespace.
  //
  // In this context margin means that the explanation has horizontal
  // margin. Flush means that it does not--that it's flush with the
  // other content on that level of the hierarchy.
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
