import React from 'react';

import styles from './SectionTitle.module.css';

function SectionTitle(props: { title: string }): React.ReactElement {
  return <h3 className={styles.heading}>{props.title}</h3>;
}

export default SectionTitle;
