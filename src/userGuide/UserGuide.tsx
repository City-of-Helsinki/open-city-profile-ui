import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './UserGuide.module.css';
import UserGuideFi from './UserGuideFi';
import UserGuideSv from './UserGuideSv';
import UserGuideEn from './UserGuideEn';
import commonContentStyles from '../common/cssHelpers/content.module.css';
import PageLayout from '../common/pageLayout/PageLayout';

function UserGuide(): React.ReactElement {
  const { i18n } = useTranslation();
  const selectStatement = () => {
    const lang = i18n.language;

    switch (lang) {
      case 'fi':
        return <UserGuideFi />;
      case 'sv':
        return <UserGuideSv />;
      case 'en':
        return <UserGuideEn />;
      default:
        return <div>Invalid language.</div>;
    }
  };

  return (
    <PageLayout title={'userGuide'}>
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

export default UserGuide;
