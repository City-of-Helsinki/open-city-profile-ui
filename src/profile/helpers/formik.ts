import { ReactNode } from 'react';
import { FormikProps } from 'formik';
import lodash from 'lodash';
import { TFunction } from 'i18next';

import { getErrorMessageWithOptions } from '../../common/schemas/schemas';
export type ErrorRenderer = ({
  message,
  options,
}: {
  message: string;
  options?: Record<string, unknown>;
}) => ReactNode;

export function getIsInvalid<FormValues>(
  formikProps: FormikProps<FormValues>,
  fieldName: string,
  isOldData = false
): boolean {
  const isNotNew = isOldData === true || formikProps.submitCount > 0;
  const isError = Boolean(lodash.get(formikProps.errors, fieldName));
  return isNotNew && isError;
}

const defaultErrorRender: ErrorRenderer = (props) => props.message;

export function getError<FormValues>(
  formikProps: FormikProps<FormValues>,
  fieldName: string,
  render: ErrorRenderer = defaultErrorRender,
  isOldData = false
): ReactNode | undefined {
  const errorMessage = lodash.get(formikProps.errors, fieldName);
  if (
    getIsInvalid(formikProps, fieldName, isOldData) &&
    typeof errorMessage === 'string'
  ) {
    return render(getErrorMessageWithOptions(errorMessage));
  }

  return undefined;
}

export function getFieldError<FormValues>(
  t: TFunction,
  formikProps: FormikProps<FormValues>,
  fieldName: string,
  isOldData = false
): ReactNode | undefined {
  const renderError: ErrorRenderer = ({ message, options }) =>
    t(message, options);
  return getError<FormValues>(formikProps, fieldName, renderError, isOldData);
}

export function createFormFieldHelpers<FormikValues>(
  t: TFunction,
  isNew: boolean
): {
  hasFieldError: (
    formikProps: FormikProps<FormikValues>,
    type: keyof FormikValues
  ) => boolean;
  getFieldErrorMessage: (
    formikProps: FormikProps<FormikValues>,
    type: keyof FormikValues
  ) => ReactNode | undefined;
} {
  return {
    hasFieldError: (formikProps, type) =>
      getIsInvalid<FormikValues>(formikProps, type as string, !isNew),
    getFieldErrorMessage: (formikProps, type) =>
      getFieldError<FormikValues>(t, formikProps, type as string, !isNew),
  };
}
