import React from 'react';
import { RouteChildrenProps } from 'react-router';

import authenticate from '../auth/authenticate';
import PageLayout from '../common/layout/PageLayout';

type Props = RouteChildrenProps & {};

function Home(props: Props) {
  return (
    <PageLayout>
      Frontpage
      <span onClick={authenticate} role="button">
        Login using tunnistamo
      </span>
    </PageLayout>
  );
}

export default Home;
