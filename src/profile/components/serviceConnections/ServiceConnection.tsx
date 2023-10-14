import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { ServiceConnectionData } from '../../helpers/getServiceConnectionData';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import CheckedLabel from '../../../common/checkedLabel/CheckedLabel';
import getAllowedDataFieldsFromService from '../../helpers/getAllowedDataFieldsFromService';
import styles from './ServiceConnections.module.css';
import encodeServiceName from '../../helpers/encodeServiceName';
import StyledButton from '../../../common/styledButton/StyledButton';

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

  const encodedServiceName = encodeServiceName(service);

  return (
    <>
      <ExpandingPanel
        title={service.title || ''}
        showInformationText
        initiallyOpen={isActive}
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
        <StyledButton
          onClick={() => onDeletion(service)}
          data-testid={`delete-service-connection-${encodedServiceName}-button`}
        >
          {t('serviceConnections.deleteConnection')}
        </StyledButton>
      </ExpandingPanel>
    </>
  );
}

export default ServiceConnection;
