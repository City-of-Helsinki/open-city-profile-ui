import React from 'react';
import classNames from 'classnames';

import Header from '../header/Header';
import Footer from '../footer/Footer';
import styles from './PageLayout.module.css';

type Props = React.PropsWithChildren<{
  className?: string;
  hideFooterLogo?: boolean;
}>;

function PageLayout(props: Props) {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={classNames(styles.content, props.className)}>
        {props.children}
      </main>
      <Footer hideFooterLogo={props.hideFooterLogo} />
    </div>
  );
}

export default PageLayout;
