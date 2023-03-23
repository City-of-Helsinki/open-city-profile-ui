import React from 'react';

import ParkingData from './ParkingData';
import { Transaction } from './Transactions';

type Props = {
  transaction: Transaction;
};

function Content({ transaction }: Props): React.ReactElement {
  return <ParkingData {...transaction} />;
}

export default Content;
