import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';
import { RouteChildrenProps } from 'react-router';

import PageLayout from '../common/layout/PageLayout';
import PROFILE_EXISTS from '../profile/profileExistsQuery';
import CreateProfile from '../profile/CreateProfile';

type Props = RouteChildrenProps & {};

function Profile(props: Props) {
  const { data, loading } = useQuery(PROFILE_EXISTS);
  const { t } = useTranslation();
  const isProfileFound = !loading && data && data.profile !== null;
  return (
    <PageLayout>
      {loading && <span>{t('profile.loading')}</span>}
      {!isProfileFound && <CreateProfile />}
    </PageLayout>
  );
}

export default Profile;
