import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import { Switch, Route, NavLink } from 'react-router-dom';
import classNames from 'classnames';
import * as Sentry from '@sentry/browser';

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

function ViewProfile() {
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
          <PageHeading text={getNicknameOrName(data)} />
          <nav
            aria-label={t('landmarks.navigation.main')}
            className={classNames(
              styles.profileNav,
              responsive.maxWidthCentered
            )}
          >
            <NavLink
              exact
              to="/"
              className={styles.profileNavLink}
              activeClassName={styles.activeProfileNavLink}
            >
              {t('nav.information')}
            </NavLink>
            <NavLink
              exact
              to="/connected-services"
              className={styles.profileNavLink}
              activeClassName={styles.activeProfileNavLink}
            >
              {t('nav.services')}
            </NavLink>
            {process.env.REACT_APP_ENVIRONMENT !== 'production' && (
              <NavLink
                exact
                to="/subscriptions"
                className={styles.profileNavLink}
                activeClassName={styles.activeProfileNavLink}
              >
                {t('nav.subscriptions')}
              </NavLink>
            )}
          </nav>
          <div className={styles.contentWrapper}>
            <Switch>
              <Route path="/connected-services">
                <ServiceConnections />
              </Route>
              {process.env.REACT_APP_ENVIRONMENT !== 'production' && (
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
