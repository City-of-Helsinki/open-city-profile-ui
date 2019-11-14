import React from 'react';
import { RouteChildrenProps, Redirect } from 'react-router';
import { useQuery } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';

import PageLayout from '../common/layout/PageLayout';
import PROFILE_EXISTS from '../profile/profileExistsQuery';

type Props = RouteChildrenProps & {};
function Profile(props: Props) {
  const { data, loading } = useQuery(PROFILE_EXISTS);
  const { t } = useTranslation();
  const isProfileFound = !loading && data && data.profile !== null;
  if (!isProfileFound) {
    return <Redirect to="create" />;
  }
  return (
    <PageLayout>
      {loading && <span>{t('profile.loading')}</span>}
      {data && JSON.stringify(data)}
    </PageLayout>
  );
}

export default Profile;
