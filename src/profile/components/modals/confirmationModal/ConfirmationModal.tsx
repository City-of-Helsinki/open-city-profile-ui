import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  IconAlertCircle,
  Dialog,
  DialogProps,
  DialogVariant,
  IconTrash,
  IconError,
  ButtonVariant,
  ButtonPresetTheme,
} from 'hds-react';

import { getModalProps } from '../getModalProps';

export type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  variant?: DialogVariant;
  hasError?: boolean;
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
  variant = 'primary',
  hasError,
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
      variant={variant}
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
          iconStart={
            hasError ? (
              <IconError color="var(--color-error)" aria-hidden="true" />
            ) : (
              <IconAlertCircle aria-hidden="true" />
            )
          }
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
          {closeButtonText !== '' && closeButtonLabelText && (
            <Button
              theme={ButtonPresetTheme.Black}
              variant={ButtonVariant.Secondary}
              onClick={onClose}
              data-testid="confirmation-modal-cancel-button"
            >
              {closeButtonLabelText}
            </Button>
          )}
          {actionButtonText && (
            <Button
              variant={
                variant === 'danger'
                  ? ButtonVariant.Danger
                  : ButtonVariant.Primary
              }
              iconStart={
                variant === 'danger' && <IconTrash aria-hidden="true" />
              }
              onClick={onConfirm}
              data-testid="confirmation-modal-confirm-button"
            >
              {actionButtonText}
            </Button>
          )}
        </Dialog.ActionButtons>
      )}
    </Dialog>
  );
}

export default ConfirmationModal;
