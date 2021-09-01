import { PhoneInput } from 'hds-react';
import React from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './multiItemRow.module.css';
import { EditDataType, PhoneValue } from '../../helpers/editData';
import { createFormFieldHelpers } from '../../helpers/formik';
import { phoneSchema } from '../../../common/schemas/schemas';
import FormButtons from '../formButtons/FormButtons';
import EditButtons from '../editButtons/EditButtons';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import { RowItemProps } from '../multiItemEditor/MultiItemEditor';
import { getFormFields } from '../../helpers/formProperties';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';

type PhoneFormikValue = { value: string };

function MultiItemRow(props: RowItemProps): React.ReactElement {
  const {
    data: { value, primary, saving },
    testId,
    disableEditButtons,
  } = props;
  const dataType: EditDataType = 'phones';
  const { t } = useTranslation();
  const {
    isEditing,
    currentAction,
    actionHandler,
    isNew,
    editButtonId,
    removeButtonId,
  } = useCommonEditHandling(props);
  const inputValue: string = (value as PhoneValue).phone || '';
  const inputId = `${testId}-value`;
  const formFields = getFormFields(dataType);
  const disableButtons = !!currentAction || !!saving;
  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    PhoneFormikValue
  >(t, isNew);

  const ariaLabels = createActionAriaLabels(dataType, inputValue, t);

  if (isEditing) {
    return (
      <div
        className={classNames([
          commonFormStyles['content-wrapper'],
          styles['row-content-wrapper'],
        ])}
      >
        <Formik
          initialValues={{
            value: inputValue,
          }}
          onSubmit={async values => {
            await actionHandler('save', {
              phone: values.value,
            });
          }}
          validationSchema={phoneSchema}
        >
          {(formikProps: FormikProps<PhoneFormikValue>) => (
            <Form>
              <FocusKeeper targetId={inputId}>
                <div className={styles['editable-row']}>
                  <Field
                    name="value"
                    id={inputId}
                    maxLength={formFields.value.max as number}
                    as={PhoneInput}
                    invalid={hasFieldError(formikProps, 'value')}
                    aria-invalid={hasFieldError(formikProps, 'value')}
                    errorText={getFieldErrorMessage(formikProps, 'value')}
                    aria-labelledby={`${dataType}-value-helper`}
                    autoFocus
                  />
                  <AccessibleFormikErrors
                    formikProps={formikProps}
                    dataType={dataType}
                  />
                  <FormButtons
                    handler={actionHandler}
                    disabled={disableButtons}
                    testId={testId}
                  />
                </div>
                <SaveIndicator action={currentAction} testId={testId} />
              </FocusKeeper>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
  return (
    <div
      className={classNames([
        commonFormStyles['content-wrapper'],
        styles['row-content-wrapper'],
      ])}
    >
      <span className={styles['value']} data-testid={`${testId}-value`}>
        {inputValue || '–'}
      </span>
      <EditButtons
        handler={actionHandler}
        actions={{
          removable: !primary,
          primary,
          setPrimary: true,
        }}
        editButtonId={editButtonId}
        removeButtonId={removeButtonId}
        disabled={disableButtons || disableEditButtons}
        testId={testId}
        ariaLabels={ariaLabels}
      />
      <SaveIndicator action={currentAction} testId={testId} />
    </div>
  );
}

export default MultiItemRow;
