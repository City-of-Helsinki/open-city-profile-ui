import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './LanguageSwitcher.module.css';

const languages = [
  { code: 'fi', label: 'Suomi' },
  { code: 'en', label: 'English' },
  { code: 'sv', label: 'Svenska' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };
  return (
    <ul className={styles.list}>
      {languages.map(lang => (
        <li key={lang.code} className={styles.item}>
          <button
            type="button"
            lang={lang.code}
            onClick={() => setLanguage(lang.code)}
          >
            {lang.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default LanguageSwitcher;
