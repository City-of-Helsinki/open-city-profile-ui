import React, { useEffect, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { getErrorMessageWithOptions } from '../../../common/schemas/schemas';
import { getFormFields, FormField } from '../../helpers/formProperties';
import { EditDataType } from '../../helpers/editData';

type FormState = {
  errors: FieldErrors<Record<string, unknown>>;
  submitCount: number;
};

type Props = {
  formState: FormState;
  dataType: EditDataType;
};

const AccessibleFormErrors = (props: Props): React.ReactElement | null => {
  const { formState, dataType } = props;
  const [currentErrorText, setLastError] = useState<string>('');
  const lastSubmitCountRef = useRef<number>(formState.submitCount);
  const { t } = useTranslation();
  const formFields = getFormFields(dataType);

  useEffect(() => {
    const errorList = Object.keys(formState.errors);

    if (!errorList.length || formState.submitCount === 0) {
      return;
    }

    const newText = errorList
      .map((errorKey) => {
        const fieldError = formState.errors[errorKey] as
          | { message?: string }
          | undefined;
        const errorMessage = fieldError?.message;

        if (!errorMessage) {
          return '';
        }

        const { message, options } = getErrorMessageWithOptions(errorMessage);
        const formField: FormField = formFields[errorKey];

        if (!formField) {
          return '';
        }

        const errorTranslation = t(message, options);
        const fieldTranslationKey = formField.translationKey;

        if (!fieldTranslationKey) {
          return '';
        }

        const fieldTranslation = t(fieldTranslationKey);

        return `${fieldTranslation} ${errorTranslation}`;
      })
      .join(' ');

    lastSubmitCountRef.current = formState.submitCount;

    setLastError(newText);
  }, [formState.errors, formState.submitCount, formFields, t]);

  const errorCount = Object.keys(formState.errors).length;

  if (!errorCount || formState.submitCount === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      className={commonFormStyles['visually-hidden']}
      data-testid={`${dataType}-error-list`}
    >
      {t('validation.errorTitleForScreenReaders')} {currentErrorText}
    </div>
  );
};

export default AccessibleFormErrors;
