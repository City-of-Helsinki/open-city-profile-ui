import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconAlertCircle, Dialog, DialogProps } from 'hds-react';

import { getModalProps } from '../getModalProps';

export type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  content?: React.FC<unknown> | string;
  actionButtonText?: string;
  closeButtonText?: string;
  preventClosing?: boolean;
};

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  actionButtonText,
  closeButtonText,
  preventClosing,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const id = 'confirmation-modal';
  const {
    titleId,
    descriptionId,
    dialogTargetElement,
    close,
    closeButtonLabelText,
  } = getModalProps({
    id,
    onClose,
    closeButtonText: closeButtonText || t('confirmationModal.cancel'),
  });
  const ContentComponent: React.FC<unknown> =
    typeof content === 'string' || typeof content === 'undefined'
      ? () => <>{content || null}</>
      : content;
  const dialogCloseProps = closeButtonLabelText
    ? ({
        close,
        closeButtonLabelText,
      } as Extract<DialogProps, 'close' | 'closeButtonLabelText'>)
    : {};
  return (
    <Dialog
      id={id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      targetElement={dialogTargetElement}
      {...dialogCloseProps}
      {...(preventClosing && { close: undefined })}
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
      {!preventClosing && (actionButtonText || closeButtonText) && (
        <Dialog.ActionButtons>
          {actionButtonText && (
            <Button
              onClick={onConfirm}
              data-testid="confirmation-modal-confirm-button"
            >
              {actionButtonText}
            </Button>
          )}
          {closeButtonText !== '' && closeButtonLabelText && (
            <Button
              variant="secondary"
              onClick={onClose}
              data-testid="confirmation-modal-cancel-button"
            >
              {closeButtonLabelText}
            </Button>
          )}
        </Dialog.ActionButtons>
      )}
    </Dialog>
  );
}

export default ConfirmationModal;
