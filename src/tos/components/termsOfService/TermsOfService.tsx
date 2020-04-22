import React from 'react';
import { IconArrowLeft } from 'hds-react/';
import { useTranslation, Trans } from 'react-i18next';
import { useHistory } from 'react-router';

import getTransComponents from '../../helpers/getTransComponents';
import tosKeys from '../../helpers/tosKeys';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import styles from './TermsOfService.module.css';
import PageLayout from '../../../common/pageLayout/PageLayout';

function TermsOfService() {
  const history = useHistory();
  const { t } = useTranslation();

  const termsOfService = tosKeys;

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <PageLayout className={styles.background}>
      <div>
        <div className={responsive.maxWidthCentered}>
          <div className={styles.container}>
            <div className={styles.back}>
              <button type="button" onClick={handleGoBack}>
                <IconArrowLeft className={styles.icon} />
              </button>
            </div>
            <div className={styles.content}>
              <h1>{t('tos.mainTitle')}</h1>
              <span className={styles.updated}>{t('tos.updated')}</span>

              {termsOfService.map((term, index) => (
                <React.Fragment key={index}>
                  <h2>{t(term.title)}</h2>
                  <Trans
                    i18nKey={term.message}
                    components={getTransComponents(term.links)}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default TermsOfService;
