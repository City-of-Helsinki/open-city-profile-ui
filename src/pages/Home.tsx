import React from 'react';
import { RouteChildrenProps } from 'react-router';

import PageLayout from '../common/layout/PageLayout';

type Props = RouteChildrenProps & {};

function Home(props: Props) {
  return (
    <PageLayout>
      Frontpage
    </PageLayout>
  );
}

export default Home;
