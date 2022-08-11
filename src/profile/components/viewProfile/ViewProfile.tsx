import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import classNames from 'classnames';

import styles from './ViewProfile.module.css';
import ProfileInformation from '../profileInformation/ProfileInformation';
import ServiceConnections from '../serviceConnections/ServiceConnections';
import Explanation from '../../../common/explanation/Explanation';
import { ProfileContext } from '../../context/ProfileContext';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';

function ViewProfile(): React.ReactElement {
  const { t } = useTranslation();
  const { isComplete } = useContext(ProfileContext);

  return (
    <React.Fragment>
      {isComplete && (
        <React.Fragment>
          <div
            className={classNames([
              commonContentStyles['common-content-area'],
              commonContentStyles['common-bottom-padding'],
              styles['content'],
            ])}
          >
            <Switch>
              <Route path="/connected-services">
                <ServiceConnections />
              </Route>
              <Route path="/">
                <Explanation
                  heading={t('profileInformation.title')}
                  text={t('profileInformation.description')}
                />
                <ProfileInformation />
              </Route>
            </Switch>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default ViewProfile;
