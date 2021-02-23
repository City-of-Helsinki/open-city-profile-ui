import React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import { Section } from 'hds-react';
import { ApolloError } from 'apollo-boost';

import styles from './ViewProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import PageHeading from '../../../common/pageHeading/PageHeading';
import ProfileInformation from '../profileInformation/ProfileInformation';
import getNicknameOrName from '../../helpers/getNicknameOrName';
import ServiceConnections from '../serviceConnections/ServiceConnections';
import Subscriptions from '../../../subscriptions/components/subsciptions/Subscriptions';
import Explanation from '../../../common/explanation/Explanation';
import useToast from '../../../toast/useToast';
import { useProfileQuery } from '../../helpers/hooks';
import parseGraphQLError from '../../helpers/parseGraphQLError';

function ViewProfile(): React.ReactElement {
  const { t } = useTranslation();
  const { createToast } = useToast();

  const { data, loading } = useProfileQuery({
    onError: (error: ApolloError) => {
      if (parseGraphQLError(error).isAllowedError) {
        return;
      }
      Sentry.captureException(error);
      createToast({ type: 'error' });
    },
  });
  return (
    <div className={styles.viewProfile}>
      {data && (
        <React.Fragment>
          <Section korosType="basic">
            <PageHeading text={getNicknameOrName(data)} />
          </Section>
          <div className={styles.contentWrapper}>
            <Switch>
              <Route path="/connected-services">
                <ServiceConnections />
              </Route>
              {window._env_.REACT_APP_ENVIRONMENT !== 'production' && (
                <Route path="/subscriptions">
                  <Subscriptions />
                </Route>
              )}
              <Route path="/">
                <div className={styles.profileContent}>
                  <div className={responsive.maxWidthCentered}>
                    <Explanation
                      main={t('profileInformation.title')}
                      titleVariant="h2"
                      small={t('profileInformation.description')}
                    />
                    <ProfileInformation data={data} loading={loading} />
                  </div>
                </div>
              </Route>
            </Switch>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default ViewProfile;
