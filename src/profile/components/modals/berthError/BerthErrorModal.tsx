import React from 'react';
import { Button, Dialog, IconAlertCircle } from 'hds-react';
import { useTranslation } from 'react-i18next';

import { getModalProps } from '../getModalProps';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function BerthErrorModal(props: Props): React.ReactElement | null {
  const { isOpen, onClose } = props;
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }
  const id = 'berth-error-modal';
  const content = t('berthErrors.explanation');
  const closeButtonText = t('berthErrors.close');
  const {
    titleId,
    descriptionId,
    dialogTargetElement,
    closeButtonLabelText,
    close,
  } = getModalProps({
    id,
    onClose,
    closeButtonText,
  });
  const dialogCloseProps = closeButtonLabelText
    ? {
        close,
        closeButtonLabelText,
      }
    : undefined;
  return (
    <Dialog
      id={id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      targetElement={dialogTargetElement}
      {...dialogCloseProps}
    >
      <Dialog.Header
        id={titleId}
        title={t('berthErrors.title')}
        iconLeft={<IconAlertCircle aria-hidden="true" />}
      />
      <Dialog.Content>
        <p id={descriptionId}>{content}</p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button variant="secondary" onClick={onClose}>
          {t('berthErrors.close')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
}

export default BerthErrorModal;
