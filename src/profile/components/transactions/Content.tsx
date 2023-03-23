import React from 'react';

import Form from './Form';
import ParkingData from './ParkingData';
import { Transaction } from './Transactions';

type Props = {
  transaction: Transaction;
};

function Content({ transaction }: Props): React.ReactElement {
  const { contentType } = transaction;
  if (contentType === 'certificate') {
    return <Form {...transaction} />;
  }
  return <ParkingData {...transaction} />;
}

export default Content;
