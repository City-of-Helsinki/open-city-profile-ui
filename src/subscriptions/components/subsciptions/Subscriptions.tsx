import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';

import Explanation from '../../../common/explanation/Explanation';
import TogglePanel from '../../../common/togglePanel/TogglePanel';
import Checkbox from '../../../common/checkbox/Checkbox';
import NotificationComponent from '../../../common/notification/NotificationComponent';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import styles from './Subscriptions.module.css';
import { QuerySubscriptions } from '../../../graphql/generatedTypes';

const QUERY_SUBSCRIPTIONS = loader('../../graphql/QuerySubscriptions.graphql');

function Subscriptions() {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const { data, loading } = useQuery<QuerySubscriptions>(QUERY_SUBSCRIPTIONS);
  const { t } = useTranslation();

  const getSubscriptionTypes = (data?: QuerySubscriptions) => {
    if (data?.subscriptionTypeCategories) {
      return data.subscriptionTypeCategories.edges.map(edge => {
        return {
          id: edge?.node?.id,
          code: edge?.node?.code,
          label: edge?.node?.label,
          options: edge?.node?.subscriptionTypes.edges.map(typeEdge => {
            return typeEdge?.node;
          }),
        };
      });
    }
  };

  if (loading) return <div>Ladataan...</div>;
  const subscriptions = getSubscriptionTypes(data);

  return (
    <div className={styles.subscriptions}>
      <div className={responsive.maxWidthCentered}>
        <Explanation
          className={styles.pageTitle}
          main={t('subscriptions.title')}
          small={t('subscriptions.explanation')}
        />

        {!data && <p className={styles.empty}>{t('subscriptions.empty')}</p>}

        {subscriptions?.map(subscription => (
          <TogglePanel
            title={subscription.label}
            informationText={t('subscriptions.subscribed')}
            key={subscription.code}
          >
            <div>
              {subscription?.options?.map(option => (
                <Checkbox
                  onChange={() => ''}
                  name={option?.code}
                  label={option?.label}
                  key={option?.code}
                />
              ))}
            </div>
          </TogglePanel>
        ))}
      </div>

      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default Subscriptions;
