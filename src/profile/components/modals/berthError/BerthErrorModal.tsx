import React from 'react';
import ReactModal from 'react-modal';
import IconClose from 'hds-react/lib/icons/IconClose';

import Button from '../../../../common/button/Button';
import styles from './BerthErrorModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function BerthErrorModal(props: Props) {
  const { isOpen, onClose } = props;

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
        <h3>
          Et voi poistaa Helsinki profiiliasi, koska venepaikka tarvitsee
          tietojasi laskutukseen
        </h3>
        <p>
          Jotta voit poistaa profiilisi, sinun on ensin irtisanottava
          venepaikkasopimuksesi
        </p>
        <ul>
          <li>Venepaikka</li>
          <li>Venepaikka</li>
          <li>Venepaikka</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Button className={styles.button} variant="outlined" onClick={onClose}>
          Sulje
        </Button>
      </div>
    </ReactModal>
  );
}

export default BerthErrorModal;
