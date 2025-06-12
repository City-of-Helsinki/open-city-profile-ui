import { CookieSettingsPage } from 'hds-react';
import React from 'react';
import classNames from 'classnames';

import PageLayout from '../common/pageLayout/PageLayout';
import commonContentStyles from '../common/cssHelpers/content.module.css';

function CookieConsentPage(): React.ReactElement | null {
  return (
    <PageLayout title={'cookies.pageName'}>
      <div
        className={classNames([
          commonContentStyles['common-content-area'],
          commonContentStyles['common-bottom-padding'],
        ])}
      >
        <CookieSettingsPage />
      </div>
    </PageLayout>
  );
}

export default CookieConsentPage;
