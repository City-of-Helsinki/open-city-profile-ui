import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import * as Sentry from '@sentry/react';
import { Button, LoadingSpinner, Notification } from 'hds-react';
import classNames from 'classnames';

import Explanation from '../../../common/explanation/Explanation';
import styles from './ServiceConnections.module.css';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import {
  ServiceConnectionsQueryVariables,
  ServiceConnectionsRoot,
} from '../../../graphql/typings';
import getServiceConnectionData, {
  ServiceConnectionData,
} from '../../helpers/getServiceConnectionData';
import createServiceConnectionsQueryVariables from '../../helpers/createServiceConnectionsQueryVariables';
import ServiceConnection from './ServiceConnection';
import ServiceConnectionRemover from './ServiceConnectionRemover';
import { getStoredQueueData } from '../../../common/actionQueue/actionQueueStorage';
import { authCodeQueuesStorageKey } from '../../../gdprApi/useAuthCodeQueues';
import { SERVICE_CONNECTIONS } from '../../graphql/ServiceConnectionsQuery';

function ServiceConnections(): React.ReactElement {
  const [deletingServiceName, setSeletingServiceName] = useState<
    string | undefined
  >(() => {
    const storedData = getStoredQueueData(authCodeQueuesStorageKey);
    return storedData ? (storedData.serviceName as string) : undefined;
  });
  const { t, i18n } = useTranslation();
  const { data, loading, refetch, error } = useQuery<
    ServiceConnectionsRoot,
    ServiceConnectionsQueryVariables
  >(SERVICE_CONNECTIONS, {
    variables: createServiceConnectionsQueryVariables(i18n.language),
    notifyOnNetworkStatusChange: true,
    onError: (loadError: Error) => {
      Sentry.captureException(loadError);
    },
  });
  const ContentWrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => (
    <div
      className={classNames([
        commonContentStyles['common-bottom-padding'],
        commonContentStyles['content'],
      ])}
    >
      <div className={classNames([commonContentStyles['common-content-area']])}>
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <ContentWrapper>
        <div
          className={styles['load-indicator']}
          data-testid={'load-indicator'}
        >
          <LoadingSpinner small />
          <span>{t('loading')}</span>
        </div>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <Notification
          type={'error'}
          label={t('notification.genericError')}
          data-testid={'service-connections-load-error'}
        >
          <p>{t('notification.defaultErrorText')}</p>
          <Button
            onClick={() => {
              refetch();
            }}
          >
            {t('notification.tryAgain')}
          </Button>
        </Notification>
      </ContentWrapper>
    );
  }

  const services = getServiceConnectionData(data);
  const hasNoServices = !loading && services.length === 0;
  const onServiceConnectionDeleted = () => {
    setSeletingServiceName(undefined);
    refetch();
  };
  const onDeleteServiceConnection = (service: ServiceConnectionData) => {
    setSeletingServiceName(service.name);
  };
  const onDeleteAborted = () => {
    setSeletingServiceName(undefined);
  };
  const getServiceData = (name: string) =>
    services.find((s) => s.name === name) as ServiceConnectionData;

  const deletingServiceData = deletingServiceName
    ? getServiceData(deletingServiceName)
    : undefined;

  return (
    <ContentWrapper>
      <Explanation
        heading={t('serviceConnections.title')}
        text={
          hasNoServices
            ? t('serviceConnections.empty')
            : t('serviceConnections.explanation')
        }
        dataTestId="service-connections-explanation"
        useHeadingHeroStyle
      />
      <div className={styles['panel-container']}>
        {services.map((service) => (
          <ServiceConnection
            key={service.name}
            service={service}
            onDeletion={onDeleteServiceConnection}
            isActive={service.name === deletingServiceName}
          />
        ))}
      </div>
      {deletingServiceData && (
        <ServiceConnectionRemover
          service={deletingServiceData}
          onDeletion={onServiceConnectionDeleted}
          onAbort={onDeleteAborted}
        />
      )}
    </ContentWrapper>
  );
}

export default ServiceConnections;
