import React from 'react';
import { Button, Dialog, IconAlertCircle } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';

import { getModalProps } from '../getModalProps';
import profileConstants from '../../../constants/profileConstants';

export type Props = {
  error?: ApolloError | Error;
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
  const getErrorTranslationKey = (resultError: Props['error']): string => {
    if (!resultError) {
      return 'deleteProfileErrorModal.genericError';
    }
    const graphQlErrors = (resultError as ApolloError).graphQLErrors;
    if (graphQlErrors) {
      const errorCodes: string[] = graphQlErrors.map(
        graphQlError => graphQlError?.extensions?.code
      );
      if (
        errorCodes.includes(
          profileConstants.CONNECTED_SERVICE_DELETION_NOT_ALLOWED_ERROR
        )
      ) {
        return 'deleteProfileErrorModal.notAllowed';
      }
    }
    return 'deleteProfileErrorModal.genericError';
  };
  const id = 'delete-profile-error-modal';
  const content = t(getErrorTranslationKey(error));
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
      isOpen={!!error}
      targetElement={dialogTargetElement}
      {...dialogCloseProps}
    >
      <Dialog.Header
        id={titleId}
        title={t('deleteProfileErrorModal.title')}
        iconLeft={<IconAlertCircle aria-hidden="true" />}
      />
      <Dialog.Content>
        <p id={descriptionId}>{content}</p>
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
