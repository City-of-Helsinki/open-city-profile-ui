import React from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';
import * as Sentry from '@sentry/browser';
import { LoadingSpinner, Notification } from 'hds-react';
import classNames from 'classnames';

import Explanation from '../../../common/explanation/Explanation';
import styles from './ServiceConnections.module.css';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import {
  ServiceConnectionsQueryVariables,
  ServiceConnectionsRoot,
} from '../../../graphql/typings';
import getServiceConnectionData from '../../helpers/getServiceConnectionData';
import createServiceConnectionsQueryVariables from '../../helpers/createServiceConnectionsQueryVariables';
import ServiceConnection from './ServiceConnection';
import StyledButton from '../../../common/styledButton/StyledButton';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

function ServiceConnections(): React.ReactElement {
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
          dataTestId={'service-connections-load-error'}
        >
          <p>{t('notification.defaultErrorText')}</p>
          <StyledButton
            onClick={() => {
              refetch();
            }}
          >
            {t('notification.tryAgain')}
          </StyledButton>
        </Notification>
      </ContentWrapper>
    );
  }

  const services = getServiceConnectionData(data);
  const hasNoServices = !loading && services.length === 0;
  const onServiceConnectionDeleted = () => {
    refetch();
  };
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
        {services.map(service => (
          <ServiceConnection
            key={service.name}
            service={service}
            onDeletion={onServiceConnectionDeleted}
          />
        ))}
      </div>
    </ContentWrapper>
  );
}

export default ServiceConnections;
