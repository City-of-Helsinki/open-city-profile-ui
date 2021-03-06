import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import * as Sentry from '@sentry/browser';

import responsive from '../../../common/cssHelpers/responsive.module.css';
import Explanation from '../../../common/explanation/Explanation';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import CheckedLabel from '../../../common/checkedLabel/CheckedLabel';
import styles from './ServiceConnections.module.css';
import { ServiceConnectionsRoot } from '../../../graphql/typings';
import getServices from '../../helpers/getServices';
import getAllowedDataFieldsFromService from '../../helpers/getAllowedDataFieldsFromService';
import useToast from '../../../toast/useToast';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

type Props = Record<string, unknown>;

function ServiceConnections(props: Props): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { createToast } = useToast();

  const { data, loading, refetch } = useQuery<ServiceConnectionsRoot>(
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
    <div className={styles['service-connections']}>
      <div className={responsive['max-width-centered']}>
        <Explanation
          main={t('serviceConnections.title')}
          small={
            hasNoServices
              ? t('serviceConnections.empty')
              : t('serviceConnections.explanation')
          }
          titleVariant="h2"
        />
        <div className={styles['panel-container']}>
          {services.map((service, index) => (
            <ExpandingPanel
              key={index}
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
              <p className={styles['created-at']}>
                {t('serviceConnections.created')}
              </p>
              <p className={styles['date-and-time']}>
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
