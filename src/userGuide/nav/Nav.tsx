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
/*
<nav id="helfi-toc-table-of-contents-list" class="table-of-contents__content">
  <ul class="table-of-contents__list">
    <li class="table-of-contents__item">
      <a
        class="table-of-contents__link"
        href="#perusopetuksen-iltapaivatoimintaan-hakeminen"
      >
        Perusopetuksen iltapäivätoimintaan hakeminen
      </a>
    </li>
    <li class="table-of-contents__item">
      <a class="table-of-contents__link" href="#hakuaika">
        Hakuaika
      </a>
    </li>
    <li class="table-of-contents__item">
      <a class="table-of-contents__link" href="#nain-haet-paikkaa">
        Näin haet paikkaa
      </a>
    </li>
    <li class="table-of-contents__item">
      <a class="table-of-contents__link" href="#maksut-2">
        Maksut
      </a>
    </li>
    <li class="table-of-contents__item">
      <a class="table-of-contents__link" href="#tietoa-iltapaivatoiminnasta">
        Tietoa iltapäivätoiminnasta
      </a>
    </li>
    <li class="table-of-contents__item">
      <a
        class="table-of-contents__link"
        href="#paikan-peruminen-tai-irtisanominen"
      >
        Paikan peruminen tai irtisanominen
      </a>
    </li>
    <li class="table-of-contents__item">
      <a class="table-of-contents__link" href="#iloa-iltapaivatoiminnasta">
        Iloa iltapäivätoiminnasta
      </a>
    </li>
    <li class="table-of-contents__item">
      <a
        class="table-of-contents__link"
        href="#iltapaivatoiminnan-aluekoordinaattorit"
      >
        Iltapäivätoiminnan aluekoordinaattorit
      </a>
    </li>
  </ul>
</nav>;

*/
