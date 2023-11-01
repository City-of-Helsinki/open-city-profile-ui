import React from 'react';
// import { Navigation } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import getLanguageCode from '../../../common/helpers/getLanguageCode';

function LanguageSwitcher(): React.ReactElement {
  const { i18n, t } = useTranslation();
  const { trackEvent } = useMatomo();
  const setLanguage = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    i18n.changeLanguage(code);
    trackEvent({ category: 'action', action: `Language selected ${code}` });
  };
  const i18NLanguageCode = getLanguageCode(i18n.language);
  const languages = [
    { code: 'fi', label: 'Suomeksi' },
    { code: 'sv', label: 'På svenska' },
    { code: 'en', label: 'In English' },
  ];
  return (
    <h2>languageselector</h2>
    // <Navigation.LanguageSelector
    //   label={i18NLanguageCode.toUpperCase()}
    //   buttonAriaLabel={t('landmarks.navigation.language')}
    // >
    //   {languages.map(lang => (
    //     <Navigation.Item
    //       href="#"
    //       onClick={(e: React.MouseEvent) => setLanguage(lang.code, e)}
    //       label={lang.label}
    //       active={i18NLanguageCode === lang.code}
    //       key={lang.code}
    //       lang={lang.code}
    //     />
    //   ))}
    // </Navigation.LanguageSelector>
  );
}
// without the componentName, this component won't show beside the menu icon in mobile.
LanguageSwitcher.componentName = 'NavigationLanguageSelector';
export default LanguageSwitcher;
