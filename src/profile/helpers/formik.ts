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
  isOldData?: boolean
): boolean {
  const isNotNew = isOldData === true || formikProps.submitCount > 0;
  const isError = Boolean(lodash.get(formikProps.errors, fieldName));

  return isNotNew && isError;
}

const defaultErrorRender: ErrorRenderer = props => props.message;

export function getError<FormValues>(
  formikProps: FormikProps<FormValues>,
  fieldName: string,
  render: ErrorRenderer = defaultErrorRender,
  isOldData?: boolean
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
  isOldData?: boolean
): ReactNode | undefined {
  const renderError: ErrorRenderer = ({ message, options }) =>
    t(message, options);
  return getError<FormValues>(formikProps, fieldName, renderError, isOldData);
}
