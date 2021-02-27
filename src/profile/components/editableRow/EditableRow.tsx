import { TextInput } from 'hds-react';
import React, { useState } from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import to from '../../../common/awaitTo';
import styles from './editableRow.module.css';
import { Action, ActionListener, EditData } from '../../helpers/mutationEditor';
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import { phoneSchema, emailSchema } from '../../../common/schemas/schemas';
import Actions from './Actions';
import EditButtons from './EditButtons';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';

type FormikValue = { value: EditData['value'] };

type Props = { data: EditData; onAction: ActionListener };
function EditableRow(props: Props): React.ReactElement {
  const { data, onAction } = props;
  const { t } = useTranslation();
  const { value, editable, removable, status, dataType, primary } = data;
  const schema = dataType === 'phones' ? phoneSchema : emailSchema;
  const [isEditing, setEditing] = useState(status === 'new');
  const isNew = !data.profileData.id;

  const actionHandler = async (action: Action): Promise<void> => {
    const promise = await onAction(action, data);
    if (action === 'cancel') {
      setEditing(false);
    }
    if (action === 'edit') {
      setEditing(true);
    }
    return promise as Promise<void>;
  };

  const hasFieldError = (formikProps: FormikProps<FormikValue>): boolean =>
    getIsInvalid<FormikValue>(formikProps, 'value', !isNew);

  const getFieldErrorMessage = (formikProps: FormikProps<FormikValue>) =>
    getFieldError<FormikValue>(t, formikProps, 'value', {}, !isNew);

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
            value,
          }}
          onSubmit={async (values, actions) => {
            actions.setSubmitting(true);
            data.value = values.value;
            const [err] = await to(onAction('save', data));
            if (err) {
              actions.setSubmitting(false);
            } else if (!isNew) {
              actions.setSubmitting(false);
              setEditing(false);
            }
          }}
          validationSchema={schema}
        >
          {(formikProps: FormikProps<FormikValue>) => (
            <Form>
              <div className={styles.editableRow}>
                <Field
                  name="value"
                  id="value"
                  maxLength="255"
                  as={TextInput}
                  invalid={hasFieldError(formikProps)}
                  helperText={getFieldErrorMessage(formikProps)}
                  autoFocus
                />
                <EditButtons
                  handler={actionHandler}
                  canSubmit={!!editable && !Boolean(formikProps.isSubmitting)}
                />
              </div>
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
      <span className={styles.value}>{value || '–'}</span>
      <Actions
        handler={actionHandler}
        actions={{
          editable,
          removable: removable && !primary,
          primary,
          setPrimary: true,
        }}
      />
    </div>
  );
}

export default EditableRow;
