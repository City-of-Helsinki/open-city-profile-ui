import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../../common/button/Button';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import styles from './DownloadData.module.css';

type Props = {};

function DownloadData(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const downloadData = () => {
    setIsLoading(true);
  };
  const { t } = useTranslation();
  return (
    <ExpandingPanel title={t('downloadData.panelTitle')}>
      <p>{t('downloadData.panelText')}</p>
      <Button
        onClick={downloadData}
        className={styles.button}
        disabled={isLoading}
      >
        {isLoading ? t('loading') : t('downloadData.button')}
      </Button>
    </ExpandingPanel>
  );
}

export default DownloadData;
