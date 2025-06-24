import { TFunction } from 'i18next';

import { ActionAriaLabels } from '../components/editButtons/EditButtons';
import { EditDataType } from './editData';

export default function createActionAriaLabels(
  dataType: EditDataType,
  value: string,
  t: TFunction
): ActionAriaLabels {
  if (
    dataType === 'phones' ||
    dataType === 'emails' ||
    dataType === 'addresses'
  ) {
    const getDataTypeAsTranslationKey = () => {
      if (dataType === 'addresses') {
        return 'Address';
      }
      if (dataType === 'emails') {
        return 'Email';
      }
      return 'Phone';
    };

    const translationKey = getDataTypeAsTranslationKey();
    const editTranslation = `profileInformation.ariaEdit${translationKey}`;
    const primaryTranslation = `profileInformation.primary${translationKey}AriaDescription`;
    const ariaSetPrimaryWithValue = `profileInformation.ariaSetPrimary${translationKey}WithValue`;
    const ariaRemoveWithValue = `profileInformation.ariaRemove${translationKey}WithValue`;
    return {
      edit: t(editTranslation, { value }),
      primary: t(primaryTranslation),
      setPrimary: t(ariaSetPrimaryWithValue, { value }),
      remove: t(ariaRemoveWithValue, { value }),
    };
  }

  return {
    edit: t('profileInformation.ariaEditBasicData'),
  };
}
