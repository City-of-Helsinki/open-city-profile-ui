import React from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import MultiItemEditor from '../multiItemEditor/MultiItemEditor';

const PhoneNumberEditor = (): React.ReactElement | null => {
  const { t } = useTranslation();
  return (
    <>
      <div className={commonFormStyles['editor-description-container']}>
        <h2>{t('profileInformation.contact')}</h2>
      </div>
      <MultiItemEditor dataType="phones" />
    </>
  );
};

export default PhoneNumberEditor;
