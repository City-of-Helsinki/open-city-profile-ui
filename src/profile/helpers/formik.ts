import { ReactNode } from 'react';
import { FormikProps } from 'formik';
import lodash from 'lodash';
import { TFunction } from 'i18next';

export function getIsInvalid<FormValues>(
  formikProps: FormikProps<FormValues>,
  fieldName: string,
  isOldData?: boolean
): boolean {
  const isNotNew = isOldData === true || formikProps.submitCount > 0;
  const isError = Boolean(lodash.get(formikProps.errors, fieldName));

  return isNotNew && isError;
}

const defaultErrorRender = (error: string) => error;

export function getError<FormValues>(
  formikProps: FormikProps<FormValues>,
  fieldName: string,
  render: (error: string) => ReactNode = defaultErrorRender,
  isOldData?: boolean
): ReactNode | undefined {
  const errorMessage = lodash.get(formikProps.errors, fieldName);
  if (
    getIsInvalid(formikProps, fieldName, isOldData) &&
    typeof errorMessage === 'string'
  ) {
    return render(errorMessage);
  }

  return undefined;
}

export function getFieldError<FormValues>(
  t: TFunction,
  formikProps: FormikProps<FormValues>,
  fieldName: string,
  options?: Record<string, unknown>,
  isOldData?: boolean
): ReactNode | undefined {
  const renderError = (message: string) => t(message, options);
  return getError<FormValues>(formikProps, fieldName, renderError, isOldData);
}
