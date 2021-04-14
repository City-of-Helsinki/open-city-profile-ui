import React from 'react';
import classNames from 'classnames';

import styles from './Loading.module.css';

type Props = React.PropsWithChildren<{
  isLoading: boolean;
  loadingText: string;
  loadingClassName: string;
}>;
function Loading(props: Props): React.ReactElement {
  return (
    <>
      {props.isLoading ? (
        <span
          className={classNames(styles.loading, props.loadingClassName)}
          data-testid="load-indicator"
        >
          {props.loadingText}
        </span>
      ) : (
        props.children
      )}
    </>
  );
}

export default Loading;
