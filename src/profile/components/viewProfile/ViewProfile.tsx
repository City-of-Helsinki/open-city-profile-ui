import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import { Section } from 'hds-react';

import styles from './ViewProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import PageHeading from '../../../common/pageHeading/PageHeading';
import ProfileInformation from '../profileInformation/ProfileInformation';
import EditProfile from '../editProfile/EditProfile';
import getNicknameOrName from '../../helpers/getNicknameOrName';
import ServiceConnections from '../serviceConnections/ServiceConnections';
import Subscriptions from '../../../subscriptions/components/subsciptions/Subscriptions';
import { MyProfileQuery } from '../../../graphql/generatedTypes';
import Explanation from '../../../common/explanation/Explanation';
import useToast from '../../../toast/useToast';

const MY_PROFILE = loader('../../graphql/MyProfileQuery.graphql');

function ViewProfile(): React.ReactElement {
  const [isEditing, setEditing] = useState(false);
  const { t } = useTranslation();
  const { createToast } = useToast();

  const { data, loading } = useQuery<MyProfileQuery>(MY_PROFILE, {
    onError: (error: Error) => {
      Sentry.captureException(error);
      createToast({ type: 'error' });
    },
  });

  const toggleEditing = () => {
    setEditing(prevState => !prevState);
  };

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
                    />
                    {!isEditing ? (
                      <ProfileInformation
                        data={data}
                        loading={loading}
                        isEditing={isEditing}
                        setEditing={toggleEditing}
                      />
                    ) : (
                      <EditProfile
                        setEditing={toggleEditing}
                        profileData={data}
                      />
                    )}
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
