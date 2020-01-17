import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as HelsinkiLogo } from '../../../common/svg/HelsinkiLogo.svg';
import styles from './Login.module.css';
import authenticate from '../../authenticate';
import PageLayout from '../../../common/pageLayout/PageLayout';
import Button from '../../../common/button/Button';

type Props = {};

function Home(props: Props) {
  const { t } = useTranslation();
  return (
    <PageLayout className={styles.background} hideFooterLogo={true}>
      <div>
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <HelsinkiLogo className={styles.logo} aria-label="Helsinki logo" />
            <h1>{t('login.title')}</h1>
            <h5>{t('login.description')}</h5>
            <Button variant="outlined" className={styles.button}>
              {t('login.login')}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default Home;
