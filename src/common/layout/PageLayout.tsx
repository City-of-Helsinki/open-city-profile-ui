import React from 'react';

import Header from '../header/Header';
import styles from './PageLayout.module.css';

type Props = React.PropsWithChildren<{}>;

function PageLayout(props: Props) {
  return (
    <>
      <Header />
      <div className={styles.pageLayout}>{props.children}</div>
    </>
  );
}

export default PageLayout;
