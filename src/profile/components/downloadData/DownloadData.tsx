import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../../common/button/Button';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import styles from './DownloadData.module.css';

type Props = {};

function DownloadData(props: Props) {
  const downloadData = () => {};
  const { t } = useTranslation();
  return (
    <ExpandingPanel title={t('downloadData.panelTitle')}>
      <span>{t('downloadData.panelText')}</span>
      <Button onClick={downloadData}>{t('downloadData.button')}</Button>
    </ExpandingPanel>
  );
}

export default DownloadData;
