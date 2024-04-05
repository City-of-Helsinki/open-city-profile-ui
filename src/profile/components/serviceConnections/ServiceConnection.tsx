import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Button } from 'hds-react';

import { ServiceConnectionData } from '../../helpers/getServiceConnectionData';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import CheckedLabel from '../../../common/checkedLabel/CheckedLabel';
import getAllowedDataFieldsFromService from '../../helpers/getAllowedDataFieldsFromService';
import styles from './ServiceConnections.module.css';
import encodeServiceName from '../../helpers/encodeServiceName';
import useProfile from '../../../auth/useProfile';
import { hasHelsinkiAccountAMR } from '../profileInformation/authenticationProviderUtil';

function ServiceConnection({
  service,
  onDeletion,
  isActive,
}: {
  service: ServiceConnectionData;
  isActive: boolean;
  onDeletion: (deletedService: ServiceConnectionData) => void;
}): React.ReactElement | null {
  const { t } = useTranslation();

  const getDateTime = (date: Date) => {
    const day = format(new Date(date), 'dd.MM.yyyy');
    const time = format(new Date(date), 'HH:mm');
    return `${day}, ${t('serviceConnections.clock')} ${time}`;
  };

  const { profile } = useProfile();
  const conflictingAuthentication = hasHelsinkiAccountAMR(profile);

  const encodedServiceName = encodeServiceName(service);

  return (
    <>
      <ExpandingPanel
        title={service.title || ''}
        showInformationText
        initiallyOpen={isActive}
        showAlert={conflictingAuthentication}
      >
        <p>{service.description}</p>
        <div
          className={styles['service-information']}
          data-testid={`service-connection-${encodedServiceName}-information`}
        >
          <p>
            <strong>{t('serviceConnections.servicePersonalData')}</strong>
          </p>
          {getAllowedDataFieldsFromService(service).map(node => (
            <CheckedLabel
              key={node.fieldName}
              value={node.label || node.fieldName}
              className={styles['allowed-data-field']}
            />
          ))}
          <p className={styles['created-at']}>
            {t('serviceConnections.created')}
          </p>
          <p className={styles['date-and-time']}>
            {getDateTime(service.connectionCreatedAt)}
          </p>
        </div>
        <Button
          disabled={conflictingAuthentication}
          onClick={() => onDeletion(service)}
          data-testid={`delete-service-connection-${encodedServiceName}-button`}
        >
          {t('serviceConnections.deleteConnection')}
        </Button>
      </ExpandingPanel>
    </>
  );
}

export default ServiceConnection;
