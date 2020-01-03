import React from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';

import responsive from '../../../common/cssHelpers/responsive.module.css';
import Explanation from '../../../common/explanation/Explanation';
import styles from './ServiceConnections.module.css';
import { ServiceConnectionQuery } from '../../graphql/__generated__/ServiceConnectionQuery';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

type Props = {};

function ServiceConnections(props: Props) {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<ServiceConnectionQuery>(
    SERVICE_CONNECTIONS
  );
  const serviceTypes = data?.myProfile?.serviceConnections?.edges.map(
    edge => edge?.node?.service.type
  );
  console.log(serviceTypes);
  return (
    <div className={styles.serviceConnections}>
      <div className={responsive.maxWidthCentered}>
        <Explanation
          className={styles.pageTitle}
          main={t('serviceConnections.title')}
          small={t('serviceConnections.explanation')}
        />
      </div>
    </div>
  );
}

export default ServiceConnections;
