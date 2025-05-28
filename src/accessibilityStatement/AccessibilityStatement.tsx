import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './AccessibilityStatement.module.css';
import AccessibilityStatementFi from './AccessibilityStatementFi';
import AccessibilityStatementSv from './AccessibilityStatementSv';
import AccessibilityStatementEn from './AccessibilityStatementEn';
import commonContentStyles from '../common/cssHelpers/content.module.css';
import PageLayout from '../common/pageLayout/PageLayout';

function AccessibilityStatement(): React.ReactElement {
  const { i18n } = useTranslation();
  const selectStatement = () => {
    const lang = i18n.languages[0].length > 2 ? i18n.languages[0].substring(0, 2) : i18n.languages[0];

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
    <PageLayout title={'accessibilityStatement'}>
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

export default AccessibilityStatement;
