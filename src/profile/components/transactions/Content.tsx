import React from 'react';

import Form from './Form';
import ParkingData from './ParkingData';
import { Document } from './index';

type Props = {
  document: Document;
};

function Content({ document }: Props): React.ReactElement {
  const { contentType } = document;
  if (contentType === 'certificate') {
    return <Form {...document} />;
  }
  return <ParkingData {...document} />;
}

export default Content;
