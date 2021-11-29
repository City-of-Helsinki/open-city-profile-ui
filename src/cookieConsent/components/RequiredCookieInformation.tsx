import React from 'react';
import { Table } from 'hds-react';

import { ConsentData } from '../consents';
import styles from './CookieConsent.module.css';

type UsedProps = keyof Omit<ConsentData, 'value' | 'ariaInputLabel'>;
type Columns = { key: UsedProps; headerName: string };
type Row = { [key in UsedProps]: string };

function RequiredCookieInformation({
  consentList,
}: {
  consentList: ConsentData[];
}): React.ReactElement {
  const cols: Columns[] = [
    { key: 'id', headerName: 'Not rendered' },
    { key: 'title', headerName: 'Nimi' },
    { key: 'text', headerName: 'Tarkoitus' },
    {
      key: 'duration',
      headerName: 'Voimassa',
    },
    { key: 'provider', headerName: 'Tarjoaja' },
  ];

  const rows = consentList.map<Row>(
    ({ value, ariaInputLabel, ...rest }) => rest
  );

  return (
    <div className={styles['consent-data-table-container']}>
      <Table cols={cols} rows={rows} indexKey="id" renderIndexCol={false} />
    </div>
  );
}

export default RequiredCookieInformation;
