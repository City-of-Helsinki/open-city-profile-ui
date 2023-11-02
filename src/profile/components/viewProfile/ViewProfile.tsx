import React, { useContext } from 'react';
import { Switch, Route } from 'react-router-dom';

import ProfileInformation from '../profileInformation/ProfileInformation';
import ServiceConnections from '../serviceConnections/ServiceConnections';
import { ProfileContext } from '../../context/ProfileContext';

function ViewProfile(): React.ReactElement {
  const { isComplete } = useContext(ProfileContext);
  console.log('isComplete');
  return (
    <React.Fragment>
      {isComplete && (
        <Switch>
          <Route path="/connected-services">
            <ServiceConnections />
          </Route>
          <Route path="/">
            <ProfileInformation />
          </Route>
        </Switch>
      )}
    </React.Fragment>
  );
}

export default ViewProfile;
