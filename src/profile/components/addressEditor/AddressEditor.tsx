import React from 'react';

import ProfileSection from '../../../common/profileSection/ProfileSection';
import MultiItemEditor from '../multiItemEditor/MultiItemEditor';

const AddressEditor = (): React.ReactElement | null => (
  <ProfileSection>
    <MultiItemEditor dataType="addresses" />
  </ProfileSection>
);

export default AddressEditor;
