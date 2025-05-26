import React, { MouseEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Header as HDSHeader,
  LanguageOption,
  Logo,
  logoFi,
  logoSv,
  LanguageSelectorProps,
  useOidcClientTracking,
  isLoggingInSignal,
  useGroupConsent,
} from 'hds-react';

import { MAIN_CONTENT_ID } from '../constants';
import { ProfileContext } from '../../profile/context/ProfileContext';
import useMatomo from '../matomo/hooks/useMatomo';

const useTrackLoginToMatomo = () => {
  const [lastSignal] = useOidcClientTracking();
  const statisticsConsent = useGroupConsent('statistics');
  const { trackEvent } = useMatomo();

  if (isLoggingInSignal(lastSignal) && statisticsConsent) {
    trackEvent({ category: 'action', action: 'Log in' });
  }
};

function Header(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const statisticsConsent = useGroupConsent('statistics');
  const { trackEvent } = useMatomo();

  const { getProfile } = useContext(ProfileContext);
  const profilePagePaths = ['/', '/connected-services'];
  const [myProfilePath, connectedServicesPath] = profilePagePaths;
  const isProfilePagePath = profilePagePaths.includes(currentPath);

  useTrackLoginToMatomo();

  const onClick = (path: string, e?: MouseEvent) => {
    e?.preventDefault();
    navigate(path);
    if (statisticsConsent) {
      trackEvent({ category: 'nav', action: `${path} click` });
    }
  };

  const availableLanguages = i18n.options.resources ? Object.keys(i18n.options.resources) : [];

  const languageLabel = (langCode: string): string => {
    switch (langCode) {
      case 'fi':
        return 'Suomi';
      case 'sv':
        return 'Svenska';
      case 'en':
        return 'English';
      default:
        return 'Suomi';
    }
  };

  const languageOptions: LanguageOption[] = availableLanguages.map((i18nLang) => ({
    value: i18nLang,
    label: languageLabel(i18nLang),
    isPrimary: false,
  }));

  const lang = i18n.resolvedLanguage;
  const logoSrcFromLanguage = lang === 'sv' ? logoSv : logoFi;

  const changeLanguageAction = (langCode: string) => {
    if (langCode !== lang) {
      if (statisticsConsent) {
        trackEvent({
          category: 'action',
          action: `Language selected ${langCode}`,
        });
      }
      i18n.changeLanguage(langCode);
    }
  };

  // List all languages as primary languages
  const sortLanguageOptions: LanguageSelectorProps['sortLanguageOptions'] = (options: LanguageOption[]) => [
    options,
    [],
  ];

  return (
    <HDSHeader onDidChangeLanguage={changeLanguageAction} languages={languageOptions} defaultLanguage={lang}>
      <HDSHeader.SkipLink skipTo={`#${MAIN_CONTENT_ID}`} label={t('skipToContent')} />
      <HDSHeader.ActionBar
        title={t('appName')}
        titleAriaLabel={t('nav.titleAriaLabel')}
        titleHref={myProfilePath}
        logo={<Logo src={logoSrcFromLanguage} alt={t('helsinkiLogo')} />}
        frontPageLabel={t('nav.goToHomePage')}
      >
        <HDSHeader.LanguageSelector sortLanguageOptions={sortLanguageOptions} />
        <HDSHeader.LoginButton
          label={t('nav.signin')}
          id='action-bar-login-action'
          errorLabel={t('nav.loginFailed')}
          errorText={t('authentication.genericError.message')}
          errorCloseAriaLabel={t('nav.closeLoginError')}
          loggingInText={t('nav.loggingIn')}
          fixedRightPosition
          redirectWithLanguage
        />
        <HDSHeader.UserMenuButton id='user-menu' fixedRightPosition data-testid='user-menu-button'>
          <HDSHeader.LogoutSubmenuButton
            label={t('nav.signout')}
            errorLabel={t('nav.logoutFailed')}
            errorText={t('authentication.genericError.message')}
            errorCloseAriaLabel={t('nav.closeLoginError')}
            id='logout-button'
            loggingOutText={t('nav.loggingOut')}
            redirectWithLanguage
          />
        </HDSHeader.UserMenuButton>
      </HDSHeader.ActionBar>
      {!!getProfile() && isProfilePagePath && (
        <HDSHeader.NavigationMenu>
          <HDSHeader.Link
            active={currentPath === myProfilePath}
            href={myProfilePath}
            label={t('nav.information')}
            onClick={(e: MouseEvent) => onClick(myProfilePath, e)}
          />
          <HDSHeader.Link
            active={currentPath === connectedServicesPath}
            href={connectedServicesPath}
            label={t('nav.services')}
            onClick={(e: MouseEvent) => onClick(connectedServicesPath, e)}
          />
        </HDSHeader.NavigationMenu>
      )}
    </HDSHeader>
  );
}

export default Header;
