import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useCookies, SessionEndedHandler } from 'hds-react';

import { MAIN_CONTENT_ID } from '../constants';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import styles from './PageLayout.module.css';
import PageMeta from '../pageMeta/PageMeta';
import { usePageLoadFocusSetter } from '../../profile/hooks/usePageLoadFocusSetter';
import useMatomo from '../matomo/hooks/useMatomo';

type Props = React.PropsWithChildren<{
  className?: string;
  title?: string;
  disableFocusing?: boolean;
  focusElementSelector?: string;
}>;

function PageLayout(props: Props): React.ReactElement {
  const location = useLocation();
  const { trackPageView } = useMatomo();
  const { getAllConsents } = useCookies();
  const { t } = useTranslation();
  const {
    focusElementSelector,
    disableFocusing = false,
    title = 'appName',
  } = props;

  const pageTitle =
    props.title !== 'appName' ? `${t(title)} - ${t('appName')}` : t('appName');

  useEffect(() => {
    if (getAllConsents().matomo) {
      trackPageView({
        documentTitle: pageTitle,
        href: window.location.href,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllConsents, location.pathname, location.search]);

  usePageLoadFocusSetter({ disableFocusing, selector: focusElementSelector });

  return (
    <div className={styles.wrapper}>
      <Header />
      <PageMeta title={pageTitle} />
      <SessionEndedHandler
        content={{
          title: t('confirmationModal.sessionEndedTitle'),
          text: t('confirmationModal.sessionEndedMessage'),
          buttonText: t('nav.signout'),
          closeButtonLabelText: t('nav.signout'),
        }}
      />
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
