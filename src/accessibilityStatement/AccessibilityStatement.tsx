import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './AccessibilityStatement.module.css';
import Header from '../common/header/Header';
import Footer from '../common/footer/Footer';
import AccessibilityStatementFi from './AccessibilityStatementFi';
import AccessibilityStatementSv from './AccessibilityStatementSv';
import AccessibilityStatementEn from './AccessibilityStatementEn';

function AccessibilityStatement() {
  const { i18n } = useTranslation();
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
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.innerWrapper}>{selectStatement()}</div>
      </div>
      <Footer />
    </div>
  );
}

export default AccessibilityStatement;
