import { TFunction } from 'i18next';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../cssHelpers/form.module.css';
import { getFormFields } from '../../profile/helpers/formProperties';
import { EditData } from '../../profile/helpers/mutationEditor';

type Props = {
  dataType: EditData['dataType'];
};

type ElementData = {
  id: string;
  content: string;
};

function createElementData({ dataType }: Props, t: TFunction): ElementData[] {
  const ariaFieldHelperWrite = t('profileInformation.ariaFieldHelperWrite');
  const ariaFieldHelperRequired = t('validation.required');
  const dataFields = getFormFields(dataType);
  return Object.keys(dataFields).map(
    (key: string): ElementData => {
      const fieldData = dataFields[key];
      return {
        id: `${dataType}-${key}-helper`,
        content: `${ariaFieldHelperWrite} 
      ${t(fieldData.translationKey)}. 
      ${fieldData.required ? ariaFieldHelperRequired : ''}`,
      };
    }
  );
}

function AccessibilityFieldHelpers(props: Props): React.ReactElement {
  const { dataType } = props;
  const { t } = useTranslation();

  const Helper = ({ id, content }: ElementData): React.ReactElement => (
    <span id={id} aria-hidden="true">
      {content}
    </span>
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => createElementData(props, t), [dataType]);
  return (
    <div className={commonFormStyles.visuallyHidden}>
      {data.map(elementData => (
        <Helper {...elementData} key={elementData.id} />
      ))}
    </div>
  );
}

export default AccessibilityFieldHelpers;
