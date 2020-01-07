import React from 'react';
import ReactModal from 'react-modal';
import IconClose from 'hds-react/lib/icons/IconClose';

import Button from '../../../common/button/Button';
import styles from './DeleteConfirmationModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function DeleteConfirmationModal(props: Props) {
  const { isOpen, onClose } = props;

  if (!isOpen) return null;
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.container}
      overlayClassName={styles.overlay}
    >
      <div className={styles.close}>
        <button type="button" onClick={onClose}>
          <IconClose className={styles.icon} />
        </button>
      </div>

      <div className={styles.content}>
        <h3>Haluatko varmasti poistaa Helsinki profiilisi</h3>
        <p>
          Poistamalla profiilisi menetät myös kaikki seuraaviin palveluihin
          tallennetut tiedot
        </p>
        <ul>
          <li>Venepaikka</li>
          <li>Venepaikka</li>
          <li>Venepaikka</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Button className={styles.button}>Peru poistaminen</Button>
        <Button className={styles.button}>Poista Helsinki profiili</Button>
      </div>
    </ReactModal>
  );
}

export default DeleteConfirmationModal;
