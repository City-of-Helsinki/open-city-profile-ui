import React from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { getFormFields } from '../../helpers/formProperties';
import { basicDataType, BasicDataValue } from '../../helpers/editData';
import { useProfileDataEditor } from '../../hooks/useProfileDataEditor';

function BasicData(): React.ReactElement | null {
  const { editDataList } = useProfileDataEditor({
    dataType: basicDataType,
  });
  const { t } = useTranslation();
  const testId = basicDataType;

  if (!editDataList || !editDataList[0]) {
    return null;
  }
  const editData = editDataList[0];
  const { value } = editData;
  const { firstName, nickname, lastName } = value as BasicDataValue;
  const formFields = getFormFields(basicDataType);

  return (
    <ProfileSection>
      <div className={commonFormStyles.contentWrapper}>
        <h3 className={commonFormStyles.sectionTitle}>
          {t('profileForm.basicData')}
        </h3>
        <div className={commonFormStyles.multiItemWrapper}>
          <LabeledValue
            label={t(formFields.firstName.translationKey)}
            value={firstName}
            testId={`${testId}-firstName`}
          />
          <LabeledValue
            label={t(formFields.nickname.translationKey)}
            value={nickname}
            testId={`${testId}-nickname`}
          />
          <LabeledValue
            label={t(formFields.lastName.translationKey)}
            value={lastName}
            testId={`${testId}-lastName`}
          />
        </div>
      </div>
    </ProfileSection>
  );
}

export default BasicData;
