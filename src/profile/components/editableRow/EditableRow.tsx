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

type Props = { data: EditData; onAction: ActionListener; testId: string };
function EditableRow(props: Props): React.ReactElement {
  const { data, onAction, testId } = props;
  const { t } = useTranslation();

  const { value, dataType, primary } = data;
  const schema = dataType === 'phones' ? phoneSchema : emailSchema;
  const {
    autoFocusTargetId,
    isNewItem,
    isEditing,
    currentSaveAction,
    actionHandler,
  } = useCommonEditHandling({ data, onAction, testId });

  const inputId = `${testId}-value`;

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
                    testId={testId}
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
      <span className={styles.value} data-testid={`${testId}-value`}>
        {value || '–'}
      </span>
      <Actions
        handler={actionHandler}
        actions={{
          removable: !primary,
          primary,
          setPrimary: true,
        }}
        ariaLabels={ariaActionLabels}
        editButtonId={autoFocusTargetId}
        disable={!!currentSaveAction}
        testId={testId}
      />
      <SaveIndicator currentAction={currentSaveAction} />
    </div>
  );
}

export default EditableRow;
