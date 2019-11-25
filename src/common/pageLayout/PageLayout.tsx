import React from 'react';

import Header from '../header/Header';

type Props = React.PropsWithChildren<{}>;

function PageLayout(props: Props) {
  return (
    <>
      <Header />
      {props.children}
    </>
  );
}

export default PageLayout;
