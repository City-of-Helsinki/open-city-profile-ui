import React from 'react';
import classNames from 'classnames';

import styles from './Nav.module.css';

interface MyProps {
  heading: string;
  items: Array<{ title: string; href: string }>;
}

function UserGuideNav({ heading, items }: MyProps): React.ReactElement {
  return (
    <div className={styles['table-of-contents']}>
      <div className={styles['table-of-contents__container']}>
        <h2 className={styles['table-of-contents__title']}>{heading}</h2>

        <nav
          id="helfi-toc-table-of-contents-list"
          className={styles['table-of-contents__content']}
        >
          <ul className={styles['table-of-contents__list']}>
            {items.map((item, i) => (
              <li className={styles['table-of-contents__item']} key={i}>
                <a
                  className={styles['table-of-contents__link']}
                  href={item.href}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default UserGuideNav;
