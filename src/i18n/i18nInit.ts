import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import fi from './fi.json';
import sv from './sv.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fi',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      fi: {
        translation: fi,
      },
      sv: {
        translation: sv,
      },
      en: {
        translation: en,
      },
    },
    detection: {
      order: ['localStorage', 'cookie'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
