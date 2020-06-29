import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery, useMutation } from '@apollo/react-hooks';
import * as Sentry from '@sentry/browser';
import { Checkbox } from 'hds-react';

import Explanation from '../../../common/explanation/Explanation';
import Button from '../../../common/button/Button';
import Loading from '../../../common/loading/Loading';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import styles from './Subscriptions.module.css';
import {
  QuerySubscriptions,
  QueryMySubscriptions,
  UpdateMyProfile,
  UpdateMyProfileVariables,
  SubscriptionInputType,
} from '../../../graphql/generatedTypes';
import getSubscriptionsData from '../../helpers/getSubscriptionsData';
import useToast from '../../../toast/useToast';

const QUERY_SUBSCRIPTIONS = loader('../../graphql/QuerySubscriptions.graphql');
const QUERY_MY_SUBSCRIPTIONS = loader(
  '../../graphql/QueryMySubscriptions.graphql'
);
const UPDATE_PROFILE = loader(
  '../../../profile/graphql/UpdateMyProfile.graphql'
);

type SubscriptionOption = {
  label?: string | null;
  id?: string;
  enabled?: boolean;
  code?: string;
};

type SubscriptionData = {
  id?: string;
  code?: string;
  label?: string | null;
  options?: SubscriptionOption[];
};

function Subscriptions() {
  const [subscriptionData, setSubscriptionData] = useState<
    SubscriptionData[]
  >();
  const { t, i18n } = useTranslation();
  const { createToast } = useToast();

  const { data, loading, refetch } = useQuery<QuerySubscriptions>(
    QUERY_SUBSCRIPTIONS,
    {
      onError: (error: Error) => {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      },
    }
  );

  const { data: profileData, loading: profileLoading } = useQuery<
    QueryMySubscriptions
  >(QUERY_MY_SUBSCRIPTIONS, {
    onError: (error: Error) => {
      Sentry.captureException(error);
      createToast({ type: 'error' });
    },
  });

  const [updateSubscriptions] = useMutation<
    UpdateMyProfile,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE, {
    refetchQueries: ['QueryMySubscriptions'],
  });

  // Refetch services when language changes, services are translated based on
  // Accept-Language header which is set in the graphql-client (src/graphql/client).
  useEffect(() => {
    const cb = () => refetch();
    i18n.on('languageChanged', cb);

    const subscriptions = getSubscriptionsData(data, profileData);
    setSubscriptionData(subscriptions);

    return () => {
      i18n.off('languageChanged', cb);
    };
  }, [data, profileData, i18n, refetch]);

  const getSubscriptionVariables = () => {
    const subscriptionVariables: SubscriptionInputType[] = [];

    subscriptionData?.forEach(subscription => {
      subscription?.options?.forEach((option: SubscriptionOption) => {
        subscriptionVariables.push({
          subscriptionTypeId: option.id,
          enabled: option.enabled,
        } as SubscriptionInputType);
      });
    });

    return subscriptionVariables;
  };

  const handleUpdate = () => {
    const variables: UpdateMyProfileVariables = {
      input: {
        profile: {
          subscriptions: getSubscriptionVariables(),
        },
      },
    };

    updateSubscriptions({ variables })
      .then(results => {
        if (!!results.data) {
          createToast({
            type: 'success',
            title: t('subscriptions.saveSuccess'),
            description: t('subscriptions.saveSuccessMessage'),
          });
        }
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      });
  };

  const handleCheckboxValues = (
    index: number,
    code?: string,
    value?: boolean
  ) => {
    const newSubscriptionData = subscriptionData || [];

    const subscription = newSubscriptionData[index]?.options?.find(
      option => option.code === code
    );
    if (subscription) {
      subscription.enabled = !value;

      const subscriptionIndex = newSubscriptionData[index]?.options?.indexOf(
        subscription
      );

      if (subscriptionIndex !== undefined) {
        newSubscriptionData[index]?.options?.splice(
          subscriptionIndex,
          1,
          subscription
        );
        setSubscriptionData([...newSubscriptionData]);
      }
    }
  };

  const resetEditedData = () => {
    const subscriptions = getSubscriptionsData(data, profileData);
    setSubscriptionData(subscriptions);
  };

  return (
    <Loading
      isLoading={loading || profileLoading}
      loadingText={t('loading')}
      loadingClassName={styles.loading}
    >
      <div className={styles.subscriptionsPage}>
        <div className={responsive.maxWidthCentered}>
          <Explanation
            main={t('subscriptions.title')}
            small={t('subscriptions.explanation')}
            titleVariant="h2"
          />

          {subscriptionData?.length === 0 && (
            <p className={styles.empty}>{t('subscriptions.empty')}</p>
          )}
          {subscriptionData && subscriptionData.length > 0 && (
            <div className={styles.subscriptionsContainer}>
              {subscriptionData.map(
                (subscription: SubscriptionData, index: number) => (
                  <div key={subscription.code} className={styles.subscription}>
                    <h2>{subscription.label}</h2>
                    {subscription?.options?.map(
                      (option: SubscriptionOption, j: number) => (
                        <Checkbox
                          onChange={() =>
                            handleCheckboxValues(
                              index,
                              option.code,
                              option.enabled
                            )
                          }
                          name={option.code}
                          id={option.code || j.toString()}
                          checked={option.enabled}
                          labelText={option.label || undefined}
                          key={option.code}
                        />
                      )
                    )}
                  </div>
                )
              )}

              <div className={styles.buttonRow}>
                <Button onClick={handleUpdate}>
                  {t('profileForm.submit')}
                </Button>
                <Button
                  className={styles.button}
                  variant="outlined"
                  onClick={resetEditedData}
                >
                  {t('profileForm.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Loading>
  );
}

export default Subscriptions;
