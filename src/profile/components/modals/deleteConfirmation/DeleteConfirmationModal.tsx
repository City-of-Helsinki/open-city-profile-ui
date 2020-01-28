import React from 'react';
import ReactModal from 'react-modal';
import IconClose from 'hds-react/lib/icons/IconClose';
import { useTranslation } from 'react-i18next';

import { ServiceConnectionsQuery } from '../../../../graphql/generatedTypes';
import getServices from '../../../helpers/getServices';
import Button from '../../../../common/button/Button';
import styles from './DeleteConfirmationModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  services?: ServiceConnectionsQuery;
};

function DeleteConfirmationModal(props: Props) {
  const { isOpen, onClose, onDelete } = props;
  const { t } = useTranslation();
  const services = getServices(props.services);

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
          <IconClose className={styles.icon} />
        </button>
      </div>

      <div className={styles.content}>
        <h3>{t('deleteProfileModal.title')}</h3>
        <p>{t('deleteProfileModal.explanation')}</p>
        <ul>
          {services.map((service, index) => (
            <li key={index}>{service.title}</li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <Button className={styles.button} variant="outlined" onClick={onClose}>
          {t('deleteProfileModal.close')}
        </Button>
        <Button className={styles.button} onClick={onDelete}>
          {t('deleteProfileModal.delete')}
        </Button>
      </div>
    </ReactModal>
  );
}

export default DeleteConfirmationModal;
