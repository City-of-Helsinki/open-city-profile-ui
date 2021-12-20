import classnames from 'classnames';
import React from 'react';

import commonResponsiveStyles from '../../common/cssHelpers/responsive.module.css';
import commonContentStyles from '../../common/cssHelpers/content.module.css';
import styles from './CookieConsent.module.css';
import { Columns, Row } from './RequiredCookieInformation';
type MobileTableProps = {
  cols: Columns[];
  rows: Row[];
};

type ColumsAsObject = Row;

const DataSet = ({
  row,
  colsAsObject,
}: {
  row: Row;
  colsAsObject: ColumsAsObject;
}): React.ReactElement => (
  <div className={styles['mobile-table-data-set']}>
    <div>
      <strong>{colsAsObject.title}: </strong>
      {row.title}
    </div>
    <div>
      <strong>{colsAsObject.duration}: </strong>
      {row.duration}
    </div>
    <div>
      <strong>{colsAsObject.provider}: </strong>
      {row.provider}
    </div>
    <p>{row.text}</p>
  </div>
);

function MobileTable({ cols, rows }: MobileTableProps): React.ReactElement {
  const colsAsObject = cols.reduce((current, col) => {
    current[col.key] = col.headerName;
    return current;
  }, {} as Partial<ColumsAsObject>) as ColumsAsObject;
  return (
    <div
      aria-hidden
      className={classnames([
        commonResponsiveStyles['visually-hidden-in-desktop'],
        commonContentStyles['common-content-area'],
        styles['mobile-table'],
      ])}
    >
      <div className={styles['mobile-item']}>
        {rows.map(row => (
          <DataSet key={row.id} row={row} colsAsObject={colsAsObject} />
        ))}
      </div>
    </div>
  );
}

export default MobileTable;
