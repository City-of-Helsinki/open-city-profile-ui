import { ReactNode } from 'react';
import { FormikProps } from 'formik';

export function getIsInvalid<FormValues>(
  formikProps: FormikProps<FormValues>,
  fieldName: keyof FormValues
) {
  const isSubmitted = formikProps.submitCount > 0;
  const isError = Boolean(formikProps.errors[fieldName]);

  return isSubmitted && isError;
}

const defaultErrorRender = (error: string) => error;

export function getError<FormValues>(
  formikProps: FormikProps<FormValues>,
  fieldName: keyof FormValues,
  render: (error: string) => React.ReactNode = defaultErrorRender
) {
  const errorMessage = formikProps.errors[fieldName];

  if (
    getIsInvalid(formikProps, fieldName) &&
    typeof errorMessage === 'string'
  ) {
    return render(errorMessage);
  }

  return undefined;
}
