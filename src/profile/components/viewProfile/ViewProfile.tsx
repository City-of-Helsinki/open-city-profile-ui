import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';

const PROFILE = loader('../../graphql/profile.graphql');

type Props = {};

function Profile(props: Props) {
  const { data, loading, error } = useQuery(PROFILE);
  return <div>{data && JSON.stringify(data)}</div>;
}

export default Profile;
