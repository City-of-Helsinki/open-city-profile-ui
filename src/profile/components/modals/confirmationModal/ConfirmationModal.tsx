import React from 'react';
import ReactModal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { IconCross, IconAlertCircle } from 'hds-react';

import styles from './ConfirmationModal.module.css';
import { ServiceConnectionsRoot } from '../../../../graphql/typings';
import getServices from '../../../helpers/getServices';
import Button from '../../../../common/button/Button';

export type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modalTitle?: string;
  modalText?: string;
  actionButtonText: string;
  services?: ServiceConnectionsRoot;
};

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  modalTitle,
  modalText,
  actionButtonText,
  services,
}: Props): React.ReactElement {
  const servicesArray = getServices(services);
  const { t } = useTranslation();
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.container}
      overlayClassName={styles.overlay}
      shouldCloseOnOverlayClick
    >
      <div className={styles.wrapper}>
        <span aria-hidden="true">
          <IconAlertCircle />
        </span>
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h3>{modalTitle}</h3>
            <p>{modalText}</p>
          </div>
          <ul>
            {servicesArray.map((service, index) => (
              <li key={index}>{service.title}</li>
            ))}
          </ul>
        </div>
        <button
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label={t('confirmationModal.close')}
        >
          <IconCross className={styles.icon} />
        </button>
      </div>

      <div className={styles.actions}>
        <Button className={styles.button} onClick={onConfirm}>
          {actionButtonText}
        </Button>
        <Button className={styles.button} variant="outlined" onClick={onClose}>
          {t('confirmationModal.cancel')}
        </Button>
      </div>
    </ReactModal>
  );
}

export default ConfirmationModal;
