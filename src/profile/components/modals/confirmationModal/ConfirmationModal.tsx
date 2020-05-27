import React from 'react';
import ReactModal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { IconClose } from 'hds-react';

import styles from './ConfirmationModal.module.css';
import { ServiceConnectionsQuery } from '../../../../graphql/generatedTypes';
import getServices from '../../../helpers/getServices';
import Button from '../../../../common/button/Button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modalTitle?: string;
  modalText?: string;
  actionButtonText: string;
  services?: ServiceConnectionsQuery;
};

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  modalTitle,
  modalText,
  actionButtonText,
  services,
}: Props) {
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
      <div className={styles.close}>
        <button type="button" onClick={onClose}>
          <IconClose className={styles.icon} />
        </button>
      </div>

      <div className={styles.content}>
        <h3>{modalTitle}</h3>
        <p>{modalText}</p>
        <ul>
          {servicesArray.map((service, index) => (
            <li key={index}>{service.title}</li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <Button className={styles.button} variant="outlined" onClick={onClose}>
          {t('confirmationModal.cancel')}
        </Button>
        <Button className={styles.button} onClick={onConfirm}>
          {actionButtonText}
        </Button>
      </div>
    </ReactModal>
  );
}

export default ConfirmationModal;
