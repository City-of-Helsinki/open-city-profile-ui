import React, { useContext, useEffect } from 'react';
import classNames from 'classnames';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useTranslation } from 'react-i18next';

import { MAIN_CONTENT_ID } from '../constants';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import styles from './PageLayout.module.css';
import PageMeta from '../pageMeta/PageMeta';
import { CookieConsentContext } from '../../cookieConsent/components/CookieConsentContext';

type Props = React.PropsWithChildren<{
  className?: string;
  title?: string;
}>;

function PageLayout(props: Props): React.ReactElement {
  const { trackPageView } = useMatomo();
  const { willRenderCookieConsentDialog } = useContext(CookieConsentContext);
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
    <div
      className={classNames([
        styles.wrapper,
        willRenderCookieConsentDialog ? styles['no-scroll'] : '',
      ])}
      aria-hidden={willRenderCookieConsentDialog ? 'true' : 'false'}
    >
      <Header />
      <PageMeta title={pageTitle} />
      <main
        id={MAIN_CONTENT_ID}
        className={classNames(styles.content, props.className)}
      >
        {props.children}
      </main>
      <Footer />
    </div>
  );
}

export default PageLayout;
