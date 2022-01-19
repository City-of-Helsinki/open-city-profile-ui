import React from 'react';
import { LoadingSpinner } from 'hds-react';

import styles from './Loading.module.css';

type Props = React.PropsWithChildren<{
  isLoading: boolean;
  loadingText: string;
}>;
function Loading(props: Props): React.ReactElement {
  return (
    <>
      {props.isLoading ? (
        <div className={styles.wrapper} data-testid="load-indicator">
          <div className={styles.content}>
            <LoadingSpinner small />
            <p>{props.loadingText}</p>
          </div>
        </div>
      ) : (
        props.children
      )}
    </>
  );
}

export default Loading;
