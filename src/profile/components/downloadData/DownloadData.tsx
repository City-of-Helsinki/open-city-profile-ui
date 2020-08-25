import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../../common/button/Button';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import styles from './DownloadData.module.css';

type Props = {
  isDownloadingData: boolean;
  isOpenByDefault: boolean;
  onDownloadClick: () => void;
};

function DownloadData({
  isDownloadingData,
  isOpenByDefault,
  onDownloadClick,
}: Props) {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ExpandingPanel
        title={t('downloadData.panelTitle')}
        defaultExpanded={isOpenByDefault}
        scrollIntoViewOnMount={isOpenByDefault}
      >
        <p>{t('downloadData.panelText')}</p>
        <Button
          onClick={onDownloadClick}
          className={styles.button}
          disabled={isDownloadingData}
        >
          {isDownloadingData ? t('loading') : t('downloadData.button')}
        </Button>
      </ExpandingPanel>
    </React.Fragment>
  );
}

export default DownloadData;
