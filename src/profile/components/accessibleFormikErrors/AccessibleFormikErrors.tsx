import React, { useRef, useState } from 'react';
import { FormikProps } from 'formik';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { getErrorMessageWithOptions } from '../../../common/schemas/schemas';
import { EditData } from '../../helpers/mutationEditor';
import { getFormFields, FormField } from '../../helpers/formProperties';

type Props = {
  formikProps: unknown;
  dataType: EditData['dataType'];
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
      .map(errorKey => {
        const errorMessage = _.get(formik.errors, errorKey);
        const { message, options } = getErrorMessageWithOptions(
          errorMessage as string
        );
        const formField: FormField = formFields[errorKey];
        const errorTranslation = t(message, options);
        const fieldTranslationKey = formField && formField.translationKey;
        const fieldTranslation = fieldTranslationKey && t(fieldTranslationKey);
        return fieldTranslation
          ? `${fieldTranslation} ${errorTranslation}`
          : '';
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
    <div role="alert" className={commonFormStyles.visuallyHidden}>
      {t('validation.errorTitleForScreenReaders')} {currentErrorText}
    </div>
  );
};

export default AccessibleFormikErrors;
