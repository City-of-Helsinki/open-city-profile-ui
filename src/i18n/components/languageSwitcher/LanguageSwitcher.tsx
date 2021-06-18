import React from 'react';
import { Navigation } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';

function LanguageSwitcher(): React.ReactElement {
  const { i18n, t } = useTranslation();
  const { trackEvent } = useMatomo();
  const setLanguage = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    i18n.changeLanguage(code);
    trackEvent({ category: 'action', action: `Language selected ${code}` });
  };
  const languages = [
    { code: 'fi', label: 'Suomeksi' },
    { code: 'sv', label: 'På svenska' },
    { code: 'en', label: 'In English' },
  ];
  return (
    <Navigation.LanguageSelector
      label={i18n.language.toUpperCase()}
      buttonAriaLabel={t('landmarks.navigation.language')}
    >
      {languages.map(lang => (
        <Navigation.Item
          href="#"
          onClick={(e: React.MouseEvent) => setLanguage(lang.code, e)}
          label={lang.label}
          active={i18n.language === lang.code}
          key={lang.code}
          lang={lang.code}
        />
      ))}
    </Navigation.LanguageSelector>
  );
}
// without the componentName, this component won't show beside the menu icon in mobile.
LanguageSwitcher.componentName = 'NavigationLanguageSelector';
export default LanguageSwitcher;
