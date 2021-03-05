import { TextInput } from 'hds-react';
import React from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './editableRow.module.css';
import { ActionListener, EditData } from '../../helpers/mutationEditor';
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import { phoneSchema, emailSchema } from '../../../common/schemas/schemas';
import Actions, { ActionAriaLabels } from './Actions';
import EditButtons from './EditButtons';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { useCommonEditHandling } from './useCommonEditHandling';

type FormikValue = { value: EditData['value'] };

type Props = { data: EditData; onAction: ActionListener };
function EditableRow(props: Props): React.ReactElement {
  const { data, onAction } = props;
  const { t } = useTranslation();

  const { value, editable, removable, dataType, primary } = data;
  const schema = dataType === 'phones' ? phoneSchema : emailSchema;
  const {
    autoFocusTargetId,
    isNewItem,
    isEditing,
    currentSaveAction,
    actionHandler,
  } = useCommonEditHandling({ data, onAction });

  const inputId = `${data.profileData.id || 'new'}-value`;

  const ariaActionLabels: ActionAriaLabels = createActionAriaLabels(data, t);

  const hasFieldError = (formikProps: FormikProps<FormikValue>): boolean =>
    getIsInvalid<FormikValue>(formikProps, 'value', !isNewItem);

  const getFieldErrorMessage = (formikProps: FormikProps<FormikValue>) =>
    getFieldError<FormikValue>(t, formikProps, 'value', !isNewItem);

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
            data.value = values.value;
            await actionHandler('save');
          }}
          validationSchema={schema}
        >
          {(formikProps: FormikProps<FormikValue>) => (
            <Form>
              <FocusKeeper targetId={inputId}>
                <div className={styles.editableRow}>
                  <Field
                    name="value"
                    id={inputId}
                    maxLength="255"
                    as={TextInput}
                    invalid={hasFieldError(formikProps)}
                    helperText={getFieldErrorMessage(formikProps)}
                    aria-labelledby={`${dataType}-value-helper`}
                    autoFocus
                  />
                  <AccessibleFormikErrors
                    formikProps={formikProps}
                    dataType={dataType}
                  />
                  <EditButtons
                    handler={actionHandler}
                    disabled={!!currentSaveAction}
                  />
                </div>
              </FocusKeeper>
              <SaveIndicator currentAction={currentSaveAction} />
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
        ariaLabels={ariaActionLabels}
        editButtonId={autoFocusTargetId}
        disable={!!currentSaveAction}
      />
      <SaveIndicator currentAction={currentSaveAction} />
    </div>
  );
}

export default EditableRow;
