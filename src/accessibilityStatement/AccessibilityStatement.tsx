import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './AccessibilityStatement.module.css';
import Header from '../common/header/Header';
import Footer from '../common/footer/Footer';
import AccessibilityStatementFi from './AccessibilityStatementFi';
import AccessibilityStatementSv from './AccessibilityStatementSv';
import AccessibilityStatementEn from './AccessibilityStatementEn';
import PageMeta from '../common/pageMeta/PageMeta';

function AccessibilityStatement(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const selectStatement = () => {
    const lang =
      i18n.languages[0].length > 2
        ? i18n.languages[0].substr(0, 2)
        : i18n.languages[0];

    switch (lang) {
      case 'fi':
        return <AccessibilityStatementFi />;
      case 'sv':
        return <AccessibilityStatementSv />;
      case 'en':
        return <AccessibilityStatementEn />;
      default:
        return <div>Invalid language.</div>;
    }
  };

  return (
    <div className={styles['page-wrapper']}>
      <Header />
      <PageMeta title={t('accessibilityStatement')} />
      <main className={styles['container']}>
        <div className={styles['inner-wrapper']}>{selectStatement()}</div>
      </main>
      <Footer />
    </div>
  );
}

export default AccessibilityStatement;
