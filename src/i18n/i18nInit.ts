import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import fi from './fi.json';
import sv from './sv.json';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  lng: 'fi',
  resources: {
    en: {
      translation: en,
    },
    fi: {
      translation: fi,
    },
    sv: {
      translation: sv,
    },
  },
});

export default i18n;
