import React, { ReactNode } from 'react';

import Header from '../header/Header';

type Props = {
  children: ReactNode;
};

function PageLayout(props: Props) {
  return (
    <div>
      <Header />
    </div>
  );
}

export default PageLayout;
