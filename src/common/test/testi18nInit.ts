import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fi from '../../i18n/fi.json';

i18n.use(initReactI18next).init({
  lng: 'fi',
  fallbackLng: 'fi',
  resources: {
    fi: {
      translations: fi,
    },
  },
});

export default i18n;
