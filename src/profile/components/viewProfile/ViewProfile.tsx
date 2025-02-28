import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';

import ProfileInformation from '../profileInformation/ProfileInformation';
import ServiceConnections from '../serviceConnections/ServiceConnections';
import { ProfileContext } from '../../context/ProfileContext';

function ViewProfile(): React.ReactElement {
  const { isComplete } = useContext(ProfileContext);

  return (
    <React.Fragment>
      {isComplete && (
        <Routes>
          <Route path="/connected-services" element={<ServiceConnections />} />
          <Route path="/*" element={<ProfileInformation />} />
        </Routes>
      )}
    </React.Fragment>
  );
}

export default ViewProfile;
