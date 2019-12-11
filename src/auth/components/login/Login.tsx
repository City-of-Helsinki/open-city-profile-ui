import React from 'react';

import authenticate from '../../authenticate';
import PageLayout from '../../../common/pageLayout/PageLayout';

type Props = {};

function Home(props: Props) {
  return (
    <PageLayout>
      <span onClick={authenticate} role="button">
        Login using tunnistamo
      </span>
    </PageLayout>
  );
}

export default Home;
