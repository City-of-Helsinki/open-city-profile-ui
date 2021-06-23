import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import { Section } from 'hds-react';

import styles from './ViewProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import PageHeading from '../../../common/pageHeading/PageHeading';
import ProfileInformation from '../profileInformation/ProfileInformation';
import ServiceConnections from '../serviceConnections/ServiceConnections';
import Explanation from '../../../common/explanation/Explanation';
import { ProfileContext } from '../../context/ProfileContext';

function ViewProfile(): React.ReactElement {
  const { t } = useTranslation();
  const { isComplete, getName } = useContext(ProfileContext);

  return (
    <div className={styles['view-profile']}>
      {isComplete && (
        <React.Fragment>
          <Section korosType="basic">
            <PageHeading
              text={getName(true)}
              dataTestId="view-profile-heading"
            />
          </Section>
          <div className={styles['content-wrapper']}>
            <Switch>
              <Route path="/connected-services">
                <ServiceConnections />
              </Route>
              <Route path="/">
                <div className={styles['profile-content']}>
                  <div className={responsive['max-width-centered']}>
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
