import React from 'react';

import Header from '../header/Header';
import Footer from '../footer/Footer';
import styles from './PageLayout.module.css';

type Props = React.PropsWithChildren<{}>;

function PageLayout(props: Props) {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.content}>{props.children}</main>
      <Footer />
    </div>
  );
}

export default PageLayout;
