import { TextInput } from 'hds-react';
import React from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './multiItemRow.module.css';
import { EditDataValue, EmailValue, PhoneValue } from '../../helpers/editData';
import { createFormFieldHelpers } from '../../helpers/formik';
import { phoneSchema, emailSchema } from '../../../common/schemas/schemas';
import FormButtons from '../formButtons/FormButtons';
import EditButtons from '../editButtons/EditButtons';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import { RowItemProps } from '../multiItemEditor/MultiItemEditor';
import { getFormFields } from '../../helpers/formProperties';

type EmailAndPhoneFormikValue = { value: string };

function MultiItemRow(props: RowItemProps): React.ReactElement {
  const {
    data: { value, primary, saving },
    testId,
    dataType,
    disableEditButtons,
  } = props;
  const { t } = useTranslation();
  const {
    isEditing,
    currentAction,
    actionHandler,
    isNew,
  } = useCommonEditHandling(props);
  const schema = dataType === 'phones' ? phoneSchema : emailSchema;
  const inputValue: string =
    (dataType === 'phones'
      ? (value as PhoneValue).phone
      : (value as EmailValue).email) || '';

  const inputId = `${testId}-value`;
  const formFields = getFormFields(dataType);
  const disableButtons = !!currentAction || !!saving;
  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    EmailAndPhoneFormikValue
  >(t, isNew);
  const convertFormPropsToEditDataValue = (
    formValues: EmailAndPhoneFormikValue
  ): Partial<EditDataValue> => {
    const formValue = formValues.value;
    const propName = dataType === 'phones' ? 'phone' : 'email';
    return {
      [propName]: formValue,
    };
  };
  if (isEditing) {
    return (
      <div
        className={classNames([
          commonFormStyles.contentWrapper,
          styles.rowContentWrapper,
        ])}
      >
        <Formik
          initialValues={{
            value: inputValue,
          }}
          onSubmit={async values => {
            const editDataValues = convertFormPropsToEditDataValue(values);
            await actionHandler('save', editDataValues);
          }}
          validationSchema={schema}
        >
          {(formikProps: FormikProps<EmailAndPhoneFormikValue>) => (
            <Form>
              <div className={styles.editableRow}>
                <Field
                  name="value"
                  id={inputId}
                  maxLength={formFields.value.max as number}
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'value')}
                  aria-invalid={hasFieldError(formikProps, 'value')}
                  helperText={getFieldErrorMessage(formikProps, 'value')}
                  aria-labelledby={`${dataType}-value-helper`}
                  autoFocus
                />
                <FormButtons
                  handler={actionHandler}
                  disabled={disableButtons}
                  testId={testId}
                />
              </div>
              <SaveIndicator action={currentAction} testId={testId} />
            </Form>
          )}
        </Formik>
      </div>
    );
  }
  return (
    <div
      className={classNames([
        commonFormStyles.contentWrapper,
        styles.rowContentWrapper,
      ])}
    >
      <span className={styles.value} data-testid={`${testId}-value`}>
        {inputValue || '–'}
      </span>
      <EditButtons
        handler={actionHandler}
        actions={{
          removable: !primary,
          primary,
          setPrimary: true,
        }}
        editButtonId={`${testId}-edit-button`}
        disabled={disableButtons || disableEditButtons}
        testId={testId}
      />
      <SaveIndicator action={currentAction} testId={testId} />
    </div>
  );
}

export default MultiItemRow;
