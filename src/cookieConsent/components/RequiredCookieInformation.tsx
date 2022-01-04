import React from 'react';
import { Table } from 'hds-react';

import { ConsentData } from '../consents';
import styles from './CookieConsent.module.css';
import responsiveStyles from '../../common/cssHelpers/responsive.module.css';
import MobileTable from './MobileTable';

type UsedProps = keyof Omit<ConsentData, 'value' | 'ariaInputLabel'>;
export type Columns = { key: UsedProps; headerName: string };
export type Row = { [key in UsedProps]: string };

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
      <div className={responsiveStyles['visually-hidden-in-mobile']}>
        <Table cols={cols} rows={rows} indexKey="id" renderIndexCol={false} />
      </div>
      <MobileTable cols={cols} rows={rows} />
    </div>
  );
}

export default RequiredCookieInformation;
