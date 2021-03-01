import React, { useContext } from 'react';
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
import parseGraphQLError from '../../helpers/parseGraphQLError';
import { ProfileContext, useProfileListener } from '../context/ProfileContext';

function ViewProfile(): React.ReactElement {
  const { t } = useTranslation();
  const { createToast } = useToast();
  const { data, fetch, isInitialized, isComplete } = useContext(ProfileContext);
  useProfileListener((error: ApolloError | Error) => {
    if (!(error as ApolloError).graphQLErrors) {
      return;
    }
    if (parseGraphQLError(error as ApolloError).isAllowedError) {
      return;
    }
    Sentry.captureException(error);
    createToast({ type: 'error' });
  });

  if (!isInitialized) {
    fetch();
  }

  return (
    <div className={styles.viewProfile}>
      {isComplete && (
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
                    <ProfileInformation />
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
