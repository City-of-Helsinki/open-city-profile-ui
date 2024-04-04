import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './AboutPage.module.css';
import AboutPageFi from './AboutPageFi';
import AboutPageSv from './AboutPageSv';
import AboutPageEn from './AboutPageEn';
import commonContentStyles from '../common/cssHelpers/content.module.css';
import PageLayout from '../common/pageLayout/PageLayout';

function AboutPage(): React.ReactElement {
  const { i18n } = useTranslation();
  const selectStatement = () => {
    const lang = i18n.language;

    switch (lang) {
      case 'fi':
        return <AboutPageFi />;
      case 'sv':
        return <AboutPageSv />;
      case 'en':
        return <AboutPageEn />;
      default:
        return <div>Invalid language.</div>;
    }
  };

  return (
    <PageLayout title={'aboutPage'}>
      <div className={styles['wrapper']}>
        <div
          className={classNames([
            commonContentStyles['common-content-area'],
            commonContentStyles['common-bottom-padding'],
            styles['content'],
          ])}
        >
          <div className={styles['inner-content']}>{selectStatement()}</div>
        </div>
      </div>
    </PageLayout>
  );
}

export default AboutPage;
