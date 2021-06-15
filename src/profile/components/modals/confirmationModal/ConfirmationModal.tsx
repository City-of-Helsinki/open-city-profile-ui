import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconAlertCircle, Button, Dialog } from 'hds-react';

import { getModalProps } from '../getModalProps';

export type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  content?: React.FC<unknown> | string;
  actionButtonText: string;
};

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  actionButtonText,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const id = 'confirmation-modal';
  const closeButtonText = t('confirmationModal.cancel');
  const {
    titleId,
    descriptionId,
    dialogTargetElement,
    close,
    closeButtonLabelText,
  } = getModalProps({
    id,
    onClose,
    closeButtonText,
  });
  const ContentComponent: React.FC<unknown> =
    typeof content === 'string' || typeof content === 'undefined'
      ? () => <>{content || null}</>
      : content;
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
      {title && (
        <Dialog.Header
          id={titleId}
          title={title}
          iconLeft={<IconAlertCircle aria-hidden="true" />}
        />
      )}
      {content && (
        <Dialog.Content>
          <div id={descriptionId}>
            <ContentComponent />
          </div>
        </Dialog.Content>
      )}
      <Dialog.ActionButtons>
        <Button
          onClick={onConfirm}
          data-testid="confirmation-modal-confirm-button"
        >
          {actionButtonText}
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          data-testid="confirmation-modal-cancel-button"
        >
          {closeButtonText}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
}

export default ConfirmationModal;
