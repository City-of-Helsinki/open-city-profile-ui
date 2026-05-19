import { ReactNode } from 'react';
import { FieldErrors } from 'react-hook-form';
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

export type RHFFormState<FormValues extends object = Record<string, unknown>> =
  {
    errors: FieldErrors<FormValues>;
    submitCount: number;
  };

function getFieldErrorObj<FormValues extends object>(
  errors: FieldErrors<FormValues>,
  fieldName: string
) {
  return lodash.get(errors, fieldName) as { message?: string } | undefined;
}

export function getIsInvalid<FormValues extends object>(
  formState: RHFFormState<FormValues>,
  fieldName: string,
  isOldData = false
): boolean {
  const isNotNew = isOldData === true || formState.submitCount > 0;
  const fieldError = getFieldErrorObj(formState.errors, fieldName);
  const isError = Boolean(fieldError?.message);
  return isNotNew && isError;
}

const defaultErrorRender: ErrorRenderer = (props) => props.message;

export function getError<FormValues extends object>(
  formState: RHFFormState<FormValues>,
  fieldName: string,
  render: ErrorRenderer = defaultErrorRender,
  isOldData = false
): ReactNode | undefined {
  const fieldError = getFieldErrorObj(formState.errors, fieldName);
  const errorMessage = fieldError?.message;
  if (
    getIsInvalid(formState, fieldName, isOldData) &&
    typeof errorMessage === 'string'
  ) {
    return render(getErrorMessageWithOptions(errorMessage));
  }

  return undefined;
}

export function getFieldError<FormValues extends object>(
  t: TFunction,
  formState: RHFFormState<FormValues>,
  fieldName: string,
  isOldData = false
): string | undefined {
  const renderError: ErrorRenderer = ({ message, options }) =>
    t(message, options);
  return getError<FormValues>(formState, fieldName, renderError, isOldData) as
    | string
    | undefined;
}

export function createFormFieldHelpers<FormValues extends object>(
  t: TFunction,
  isNew: boolean
): {
  hasFieldError: (
    formState: RHFFormState<FormValues>,
    type: keyof FormValues
  ) => boolean;
  getFieldErrorMessage: (
    formState: RHFFormState<FormValues>,
    type: keyof FormValues
  ) => string | undefined;
} {
  return {
    hasFieldError: (formState, type) =>
      getIsInvalid<FormValues>(formState, type as string, !isNew),
    getFieldErrorMessage: (formState, type) =>
      getFieldError<FormValues>(t, formState, type as string, !isNew),
  };
}
