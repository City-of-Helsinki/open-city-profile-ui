import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { ServiceConnectionData } from '../../helpers/getServiceConnectionData';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import CheckedLabel from '../../../common/checkedLabel/CheckedLabel';
import getAllowedDataFieldsFromService from '../../helpers/getAllowedDataFieldsFromService';
import styles from './ServiceConnections.module.css';

function ServiceConnection(props: {
  service: ServiceConnectionData;
  onDeletion: (deletedService: ServiceConnectionData) => void;
}): React.ReactElement | null {
  const { service, onDeletion } = props;
  const { t } = useTranslation();
  const getDateTime = (date: Date) => {
    const day = format(new Date(date), 'dd.MM.yyyy');
    const time = format(new Date(date), 'HH:mm');
    return `${day}, ${t('serviceConnections.clock')} ${time}`;
  };
  return (
    <ExpandingPanel
      title={service.title || ''}
      showInformationText
      initiallyOpen={false}
    >
      <p>{service.description}</p>
      <p className={styles['service-information']}>
        {t('serviceConnections.servicePersonalData')}
      </p>
      {getAllowedDataFieldsFromService(service).map(node => (
        <CheckedLabel
          key={node.fieldName}
          value={node.label || node.fieldName}
          className={styles['allowed-data-field']}
        />
      ))}
      <p className={styles['created-at']}>{t('serviceConnections.created')}</p>
      <p className={styles['date-and-time']}>
        {getDateTime(service.connectionCreatedAt)}
      </p>
    </ExpandingPanel>
  );
}

export default ServiceConnection;
