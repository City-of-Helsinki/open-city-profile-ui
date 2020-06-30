import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import { format } from 'date-fns';
import * as Sentry from '@sentry/browser';

import responsive from '../../../common/cssHelpers/responsive.module.css';
import Explanation from '../../../common/explanation/Explanation';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import CheckedLabel from '../../../common/checkedLabel/CheckedLabel';
import styles from './ServiceConnections.module.css';
import { ServiceConnectionsQuery } from '../../../graphql/generatedTypes';
import getServices from '../../helpers/getServices';
import getAllowedDataFieldsFromService from '../../helpers/getAllowedDataFieldsFromService';
import useToast from '../../../toast/useToast';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

type Props = {};

function ServiceConnections(props: Props) {
  const { t, i18n } = useTranslation();
  const { createToast } = useToast();

  const { data, loading, refetch } = useQuery<ServiceConnectionsQuery>(
    SERVICE_CONNECTIONS,
    {
      onError: (error: Error) => {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      },
    }
  );

  // Refetch services when language changes, services are translated based on
  // Accept-Language header which is set in the graphql-client (src/graphql/client).
  useEffect(() => {
    const cb = () => refetch();
    i18n.on('languageChanged', cb);
    return () => {
      i18n.off('languageChanged', cb);
    };
  });

  const getDateTime = (date: Date) => {
    const day = format(new Date(date), 'dd.MM.yyyy');
    const time = format(new Date(date), 'HH:mm');
    return `${day}, ${t('serviceConnections.clock')} ${time}`;
  };

  const services = getServices(data);
  const hasNoServices = !loading && services.length === 0;
  return (
    <div className={styles.serviceConnections}>
      <div className={responsive.maxWidthCentered}>
        <Explanation
          main={t('serviceConnections.title')}
          small={t('serviceConnections.explanation')}
          titleVariant="h2"
        />
        {hasNoServices && (
          <p className={styles.empty}>{t('serviceConnections.empty')}</p>
        )}
        <div className={styles.panelContainer}>
          {services.map((service, index) => (
            <ExpandingPanel
              key={index}
              title={service.title || ''}
              showInformationText
            >
              <p>{service.description}</p>
              <p className={styles.serviceInformation}>
                {t('serviceConnections.servicePersonalData')}
              </p>
              {getAllowedDataFieldsFromService(service).map(node => (
                <CheckedLabel
                  key={node.fieldName}
                  value={node.label || node.fieldName}
                  className={styles.allowedDataField}
                />
              ))}
              <p className={styles.createdAt}>
                {t('serviceConnections.created')}
              </p>
              <p className={styles.dateAndTime}>
                {getDateTime(service.createdAt)}
              </p>
            </ExpandingPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServiceConnections;
