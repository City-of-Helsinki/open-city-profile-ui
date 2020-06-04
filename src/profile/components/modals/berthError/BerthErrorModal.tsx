import React from 'react';
import ReactModal from 'react-modal';
import { IconCross } from 'hds-react';
import { useTranslation } from 'react-i18next';

import Button from '../../../../common/button/Button';
import styles from './BerthErrorModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function BerthErrorModal(props: Props) {
  const { isOpen, onClose } = props;
  const { t } = useTranslation();

  if (!isOpen) return null;
  return (
    <ReactModal
      ariaHideApp={false}
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.container}
      overlayClassName={styles.overlay}
      shouldCloseOnOverlayClick
    >
      <div className={styles.close}>
        <button type="button" onClick={onClose}>
          <IconCross className={styles.icon} />
        </button>
      </div>

      <div className={styles.content}>
        <h3>{t('berthErrors.title')}</h3>
        <p>{t('berthErrors.explanation')}</p>
      </div>

      <div className={styles.actions}>
        <Button className={styles.button} variant="outlined" onClick={onClose}>
          {t('berthErrors.close')}
        </Button>
      </div>
    </ReactModal>
  );
}

export default BerthErrorModal;
