import _ from 'lodash';
import React from 'react';

import styles from './ActivityView.module.css';
import { Activity, History } from './index';
import { Link } from '../../../common/copyOfHDSLink/Link';

function ActivityLink({ link }: { link: Activity['link'] }) {
  if (!link || !link.display_text) {
    return null;
  }
  return (
    <Link external href={link.url} openInNewTab>
      {link.display_text}
    </Link>
  );
}

function ActivityView({ activities }: History): React.ReactElement {
  const columnsStyle = styles['data-columns'];
  return (
    <div className={styles['container']}>
      {activities.map(data => (
        <div key={data.created}>
          <h3>{data.title}</h3>
          <div className={columnsStyle}>{data.message}</div>
          <ActivityLink link={data.link} />
        </div>
      ))}
    </div>
  );
}

export default ActivityView;
