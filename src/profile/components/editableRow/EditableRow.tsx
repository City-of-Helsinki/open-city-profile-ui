import { TextInput } from 'hds-react';
import React, { useState } from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import to from '../../../common/awaitTo';
import styles from './editableRow.module.css';
import {
  Action,
  ActionListener,
  EditData,
  isNew,
  resetEditDataValue,
} from '../../helpers/mutationEditor';
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import { phoneSchema, emailSchema } from '../../../common/schemas/schemas';
import Actions, { ActionAriaLabels, ActionHandler } from './Actions';
import EditButtons from './EditButtons';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import { useAutoFocus } from '../../helpers/useAutoFocus';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import SaveIndicator from '../saveIndicator/SaveIndicator';

type FormikValue = { value: EditData['value'] };

type Props = { data: EditData; onAction: ActionListener };
function EditableRow(props: Props): React.ReactElement {
  const { data, onAction } = props;
  const { t } = useTranslation();
  // new item will never autofocus to "edit"-button, but React hooks cannot be conditional
  const { autoFocusTargetId, activateAutoFocusing } = useAutoFocus({
    targetId: `${data.profileData.id || 'new'}-edit-button`,
  });
  const { value, editable, removable, dataType, primary } = data;
  const schema = dataType === 'phones' ? phoneSchema : emailSchema;
  const isNewItem = isNew(data);
  const [isEditing, setEditing] = useState(isNewItem);
  const [currentSaveAction, setCurrentSaveAction] = useState<
    Action | undefined
  >(undefined);
  const actionHandler: ActionHandler = async action => {
    if (action === 'set-primary' || action === 'remove' || action === 'save') {
      setCurrentSaveAction(action);
    }
    const [err] = await to(onAction(action, data));
    if (!err && isNewItem) {
      return Promise.resolve();
    }
    if (err || action !== 'remove') {
      setCurrentSaveAction(undefined);
    }
    if (action === 'cancel' && !isNewItem) {
      resetEditDataValue(data);
      activateAutoFocusing();
      setEditing(false);
    } else if (action === 'edit') {
      setEditing(true);
    } else if (action === 'save') {
      activateAutoFocusing();
      setEditing(false);
    }
    return Promise.resolve();
  };

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
