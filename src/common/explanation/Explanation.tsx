import React from 'react';
import classNames from 'classnames';

import styles from './Explanation.module.css';

type Classes = {
  container?: string;
  main?: string;
  small?: string;
};

type Props = {
  main: string;
  small?: string;
  classes?: Classes;
};

function Explanation(props: Props) {
  return (
    <div className={classNames(styles.container, props.classes?.container)}>
      <h2 className={classNames(styles.main, props.classes?.main)}>
        {props.main}
      </h2>
      {props.small && (
        <p className={classNames(styles.small, props.classes?.small)}>
          {props.small}
        </p>
      )}
    </div>
  );
}

export default Explanation;
