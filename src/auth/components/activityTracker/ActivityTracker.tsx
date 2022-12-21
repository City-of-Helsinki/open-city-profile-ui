import React from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmationModal from '../../../profile/components/modals/confirmationModal/ConfirmationModal';
import authService from '../../authService';
import useManualTokenRenewal from '../../useManualTokenRenewal';

function ActivityTracker(): React.ReactElement | null {
  const { t } = useTranslation();
  const { warn, cancelTimeout } = useManualTokenRenewal({ authService });
  if (warn) {
    return (
      <ConfirmationModal
        isOpen
        onClose={() => cancelTimeout()}
        onConfirm={() => cancelTimeout()}
        actionButtonText={t('confirmationModal.continue')}
        closeButtonText=""
        title={t('confirmationModal.idleWarningTitle')}
        content={() => <p>{t('confirmationModal.idleWarning')}</p>}
      />
    );
  }

  return null;
}

export default ActivityTracker;
