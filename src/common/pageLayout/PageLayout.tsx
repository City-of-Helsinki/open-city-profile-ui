import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useTranslation } from 'react-i18next';

import { MAIN_CONTENT_ID } from '../constants';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import styles from './PageLayout.module.css';

type Props = React.PropsWithChildren<{
  className?: string;
  hideFooterLogo?: boolean;
  title?: string;
}>;

function PageLayout(props: Props) {
  const { trackPageView } = useMatomo();
  const { t } = useTranslation();
  const { title = 'appName' } = props;

  const pageTitle =
    props.title !== 'appName' ? `${t(title)} - ${t('appName')}` : t('appName');

  useEffect(() => {
    trackPageView({
      documentTitle: pageTitle,
      href: window.location.href,
    });
  }, [trackPageView, pageTitle]);

  return (
    <div className={styles.wrapper}>
      <Header />
      <main
        id={MAIN_CONTENT_ID}
        className={classNames(styles.content, props.className)}
      >
        {props.children}
      </main>
      <Footer hideFooterLogo={props.hideFooterLogo} />
    </div>
  );
}

export default PageLayout;
