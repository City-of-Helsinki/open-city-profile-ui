import React from 'react';
import { Button, Dialog, DialogProps, IconAlertCircle } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';

import { getModalProps } from '../getModalProps';
import { DeleteResultLists } from '../../../helpers/parseDeleteProfileResult';
import DeleteFailureList from '../../deleteProfile/DeleteFailureList';
import { isInsufficientLoaResult } from '../../../../gdprApi/actions/deleteProfile';

export type Props = {
  error?: ApolloError | Error | DeleteResultLists;
  onClose: () => void;
};

function DeleteProfileError({
  error,
  onClose,
}: Props): React.ReactElement | null {
  const { t } = useTranslation();

  if (!error) {
    return null;
  }
  const failureList = (error as DeleteResultLists).failures || [];
  const errorIsListOfServices = !!failureList.length;
  const errorIsInsufficientLoa = isInsufficientLoaResult({
    errorMessage: (error as Error).message,
    result: undefined,
  });
  const id = 'delete-profile-error-modal';
  const closeButtonText = t('notification.closeButtonText');
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
      isOpen={!!error}
      targetElement={dialogTargetElement}
      {...dialogCloseProps}
    >
      <Dialog.Header
        id={titleId}
        title={t('deleteProfileModal.deletionErrorTitle')}
        iconLeft={<IconAlertCircle aria-hidden="true" />}
      />
      <Dialog.Content>
        {errorIsListOfServices ? (
          <DeleteFailureList {...(error as DeleteResultLists)} />
        ) : errorIsInsufficientLoa ? (
          <p id={descriptionId} data-testid={'delete-profile-insufficient-loa'}>
            {t('deleteProfile.deleteInsufficientLoa')}
          </p>
        ) : (
          <p id={descriptionId} data-testid={'delete-profile-generic-error'}>
            {t('deleteProfile.deleteFailed')}
          </p>
        )}
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          variant="secondary"
          onClick={onClose}
          data-testid={`${id}-close-button`}
        >
          {closeButtonLabelText}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
}

export default DeleteProfileError;
