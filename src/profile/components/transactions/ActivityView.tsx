import _ from 'lodash';
import React from 'react';

import styles from './ActivityView.module.css';
import { History } from './index';

function ActivityView({ activities }: History): React.ReactElement {
  const columnsStyle = styles['data-columns'];
  return (
    <div className={styles['container']}>
      {activities.map(data => (
        <div key={data.created}>
          <h3>{data.title}</h3>
          <div className={columnsStyle}>{data.message}</div>
        </div>
      ))}
    </div>
  );
}

export default ActivityView;
