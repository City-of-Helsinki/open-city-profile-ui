import React from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';

import responsive from '../../../common/cssHelpers/responsive.module.css';
import Explanation from '../../../common/explanation/Explanation';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import styles from './ServiceConnections.module.css';
import { ServiceConnectionQuery } from '../../graphql/__generated__/ServiceConnectionQuery';
import { ServiceType } from '../../../graphql/__generated__/globalTypes';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

const getServiceTypes = (data?: ServiceConnectionQuery) => {
  if (data?.myProfile?.serviceConnections) {
    return data.myProfile.serviceConnections.edges.map(edge => {
      if (edge?.node?.service.type) {
        return edge.node.service.type;
      }
      return false;
    });
  }
  return [];
};

type Props = {};

function ServiceConnections(props: Props) {
  const { t } = useTranslation();
  const { data } = useQuery<ServiceConnectionQuery>(SERVICE_CONNECTIONS);
  const services = getServiceTypes(data);
  return (
    <div className={styles.serviceConnections}>
      <div className={responsive.maxWidthCentered}>
        <Explanation
          className={styles.pageTitle}
          main={t('serviceConnections.title')}
          small={t('serviceConnections.explanation')}
        />
        {services.map(
          (service, index) =>
            service && (
              <ExpandingPanel key={index} title={ServiceType[service]} />
            )
        )}
      </div>
    </div>
  );
}

export default ServiceConnections;
