import React, { useRef, useState } from 'react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { getErrorMessageWithOptions } from '../../../common/schemas/schemas';
import { getFormFields, FormField } from '../../helpers/formProperties';
import { EditDataType } from '../../helpers/editData';

type Props = {
  formikProps: unknown;
  dataType: EditDataType;
};

const AccessibleFormikErrors = (props: Props): React.ReactElement | null => {
  const formik = props.formikProps as FormikProps<Record<string, unknown>>;
  const [currentErrorText, setLastError] = useState<string>('');
  const lastSubmitCountRef = useRef<number>(formik.submitCount);
  const { t } = useTranslation();
  const errorList = Object.keys(formik.errors);
  const errorCount = errorList.length;
  const formFields = getFormFields(props.dataType);
  const errorsToText = () =>
    errorList
      .map((errorKey) => {
        const errorMessage = formik.errors[errorKey];
        const { message, options } = getErrorMessageWithOptions(errorMessage as string);
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
  if (!errorCount || formik.submitCount === 0) {
    return null;
  }
  if (formik.submitCount !== lastSubmitCountRef.current) {
    lastSubmitCountRef.current = formik.submitCount;
    setLastError(errorsToText());
  }

  return (
    <div role='alert' className={commonFormStyles['visually-hidden']} data-testid={`${props.dataType}-error-list`}>
      {t('validation.errorTitleForScreenReaders')} {currentErrorText}
    </div>
  );
};

export default AccessibleFormikErrors;
