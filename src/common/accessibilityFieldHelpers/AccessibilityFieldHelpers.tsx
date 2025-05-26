import { TFunction } from 'i18next';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../cssHelpers/form.module.css';
import { getFormFields } from '../../profile/helpers/formProperties';
import { EditDataType } from '../../profile/helpers/editData';

type Props = {
  dataType: EditDataType;
};

type ElementData = {
  id: string;
  content: string;
};

function createElementData({ dataType }: Props, t: TFunction): ElementData[] {
  const validationRequiredTranslation = t('validation.required');
  const dataFields = getFormFields(dataType);
  return Object.keys(dataFields).map((key: string): ElementData => {
    const fieldData = dataFields[key];
    const fieldTranslation = t(fieldData.translationKey);
    const translationKey = fieldData.comboBox
      ? 'profileInformation.ariaComboBoxHelperText'
      : 'profileInformation.ariaInputFieldHelperText';
    const content = t(translationKey, {
      field: fieldTranslation,
      requiredInfo: fieldData.required ? validationRequiredTranslation : '',
    });
    return {
      id: `${dataType}-${key}-helper`,
      content,
    };
  });
}

function AccessibilityFieldHelpers(props: Props): React.ReactElement {
  const { dataType } = props;
  const { t, i18n } = useTranslation();

  const Helper = ({ id, content }: ElementData): React.ReactElement => (
    <span id={id} aria-hidden='true'>
      {content}
    </span>
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => createElementData(props, t), [dataType, i18n.language]);
  return (
    <div className={commonFormStyles['visually-hidden']}>
      {data.map((elementData) => (
        <Helper {...elementData} key={elementData.id} />
      ))}
    </div>
  );
}

export default AccessibilityFieldHelpers;
