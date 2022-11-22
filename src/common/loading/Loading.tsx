import React from 'react';
import { LoadingSpinner } from 'hds-react';

import styles from './Loading.module.css';

type Props = React.PropsWithChildren<{
  isLoading: boolean;
  loadingText: string;
  dataTestId?: string;
  alignLeft?: boolean;
}>;
function Loading(props: Props): React.ReactElement {
  const { isLoading, alignLeft, dataTestId, loadingText, children } = props;
  return (
    <>
      {isLoading ? (
        <div
          className={
            alignLeft ? styles['wrapper-left-aligned'] : styles.wrapper
          }
          data-testid={dataTestId || 'load-indicator'}
          aria-live="polite"
          aria-busy="true"
        >
          <div className={styles.content}>
            <LoadingSpinner small />
            <p>{loadingText}</p>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
}

export default Loading;
