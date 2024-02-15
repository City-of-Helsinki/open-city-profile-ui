import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fi from '../../i18n/fi.json';
import sv from '../../i18n/sv.json';
import en from '../../i18n/en.json';

i18n.use(initReactI18next).init({
  lng: 'fi',
  fallbackLng: 'fi',
  resources: {
    fi: {
      translations: fi,
    },
    sv: {
      translations: sv,
    },
    en: {
      translations: en,
    },
  },
});

export default i18n;
