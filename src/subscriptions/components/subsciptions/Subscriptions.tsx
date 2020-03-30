import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery, useMutation } from '@apollo/react-hooks';

import Explanation from '../../../common/explanation/Explanation';
import Button from '../../../common/button/Button';
import Checkbox from '../../../common/checkbox/Checkbox';
import NotificationComponent from '../../../common/notification/NotificationComponent';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import styles from './Subscriptions.module.css';
import {
  QuerySubscriptions,
  QueryMySubscriptions,
  UpdateMyProfile,
  UpdateMyProfileVariables,
} from '../../../graphql/generatedTypes';
import getSubscriptionsTypes from '../../helpers/getSubscriptions';
import getMySubscriptionTypes from '../../helpers/getMySubscriptions';

const QUERY_SUBSCRIPTIONS = loader('../../graphql/QuerySubscriptions.graphql');
const QUERY_MY_SUBSCRIPTIONS = loader(
  '../../graphql/QueryMySubscriptions.graphql'
);
const UPDATE_PROFILE = loader(
  '../../../profile/graphql/UpdateMyProfile.graphql'
);

type Data = {
  subscriptionTypeId?: string;
  enabled?: boolean;
  code?: string;
};

function Subscriptions() {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [subscriptionData, setSubscriptionData] = useState<Data[]>();

  const { data, loading } = useQuery<QuerySubscriptions>(QUERY_SUBSCRIPTIONS, {
    onError: () => setShowNotification(true),
  });

  const { data: profileData, loading: profileLoading } = useQuery<
    QueryMySubscriptions
  >(QUERY_MY_SUBSCRIPTIONS);

  const [updateSubscriptions] = useMutation<
    UpdateMyProfile,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE);

  const { t } = useTranslation();

  const handleUpdate = () => {
    const variables: UpdateMyProfileVariables = {
      input: {
        profile: {
          subscriptions: subscriptionData,
        },
      },
    };

    updateSubscriptions({ variables })
      .then(res => console.log(res))
      .catch((error: Error) => console.log('ERROR', error));
  };

  const handleCheckboxValues = (code?: string) => {
    const newSubscriptionData = subscriptionData || [];
    const subscription = newSubscriptionData.find(
      (data: Data) => data.code === code
    );

    if (subscription) {
      const index = newSubscriptionData.indexOf(subscription);
      newSubscriptionData[index].enabled = !newSubscriptionData[index].enabled;
    } else {
      newSubscriptionData.push({ subscriptionTypeId: '', enabled: true, code });
    }
    setSubscriptionData(newSubscriptionData);
    console.log('NEWSUB', newSubscriptionData);
  };

  const checkSubscriptionStatus = (code?: string) => {
    if (!subscriptionData || !code) return false;

    const data = subscriptionData.find((data: Data) => data.code === code);
    return data ? data?.enabled : false;
  };

  useEffect(() => {
    if (!subscriptionData && !profileLoading) {
      console.log('USEEFFECT');
      setSubscriptionData(getMySubscriptionTypes(profileData));
    }
  }, [profileData, profileLoading, subscriptionData]);

  if (loading || profileLoading) return <div>Ladataan...</div>;
  const subscriptions = getSubscriptionsTypes(data, profileData);

  return (
    <div className={styles.subscriptionsPage}>
      <div className={responsive.maxWidthCentered}>
        <Explanation
          className={styles.pageTitle}
          main={t('subscriptions.title')}
          small={t('subscriptions.explanation')}
        />
        {!data && <p className={styles.empty}>{t('subscriptions.empty')}</p>}
        {data && (
          <div className={styles.subscriptionsContainer}>
            {subscriptions?.map(subscription => (
              <div key={subscription.code} className={styles.subscription}>
                <h3>{subscription.label}</h3>
                {subscription?.options?.map(option => (
                  <Checkbox
                    onChange={() => handleCheckboxValues(option?.code)}
                    name={option?.code}
                    label={option?.label}
                    key={option?.code}
                  />
                ))}
              </div>
            ))}
            <div className={styles.buttonRow}>
              <Button onClick={handleUpdate}>Tallenna</Button>
              <Button className={styles.button} variant="outlined">
                Peruuta
              </Button>
            </div>
          </div>
        )}
      </div>

      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default Subscriptions;
