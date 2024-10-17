import React, { MouseEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Header as HDSHeader,
  LanguageOption,
  Logo,
  logoFi,
  logoSv,
  LanguageSelectorProps,
  useCookies,
} from 'hds-react';

import { MAIN_CONTENT_ID } from '../constants';
import { ProfileContext } from '../../profile/context/ProfileContext';
import useMatomo from '../matomo/hooks/useMatomo';

function Header(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const currentPath = location.pathname;

  const { getAllConsents } = useCookies();
  const { trackEvent } = useMatomo();

  const { getProfile } = useContext(ProfileContext);
  const profilePagePaths = ['/', '/connected-services'];
  const [myProfilePath, connectedServicesPath] = profilePagePaths;
  const isProfilePagePath = profilePagePaths.includes(currentPath);

  const onClick = (path: string, e?: MouseEvent) => {
    e?.preventDefault();
    history.push(path);
    if (getAllConsents().matomo) {
      trackEvent({ category: 'nav', action: `${path} click` });
    }
  };

  const availableLanguages = i18n.options.resources
    ? Object.keys(i18n.options.resources)
    : [];

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

  const languageOptions: LanguageOption[] = availableLanguages.map(
    i18nLang => ({
      value: i18nLang,
      label: languageLabel(i18nLang),
      isPrimary: false,
    })
  );

  const lang = i18n.resolvedLanguage;
  const logoSrcFromLanguage = lang === 'sv' ? logoSv : logoFi;

  const changeLanguageAction = (langCode: string) => {
    if (langCode !== lang) {
      if (getAllConsents().matomo) {
        trackEvent({
          category: 'action',
          action: `Language selected ${langCode}`,
        });
      }
      i18n.changeLanguage(langCode);
    }
  };

  // List all languages as primary languages
  const sortLanguageOptions: LanguageSelectorProps['sortLanguageOptions'] = (
    options: LanguageOption[]
  ) => [options, []];

  return (
    <HDSHeader
      onDidChangeLanguage={changeLanguageAction}
      languages={languageOptions}
      defaultLanguage={lang}
    >
      <HDSHeader.SkipLink
        skipTo={`#${MAIN_CONTENT_ID}`}
        label={t('skipToContent')}
      />
      <HDSHeader.ActionBar
        title={t('appName')}
        titleAriaLabel={t('nav.titleAriaLabel')}
        titleHref={myProfilePath}
        logo={<Logo src={logoSrcFromLanguage} alt={t('helsinkiLogo')} />}
        frontPageLabel={t('nav.goToHomePage')}
      >
        <HDSHeader.LanguageSelector sortLanguageOptions={sortLanguageOptions} />

        {/* TODO: Translate text*/}
        <HDSHeader.LoginButton
          label="Log in"
          id="action-bar-login-action"
          errorLabel="Login failed!"
          errorText="Redirection to the OIDC server failed. Try again!"
          errorCloseAriaLabel="Close this error notification"
          loggingInText="Logging in"
          fixedRightPosition
        />
        <HDSHeader.UserMenuButton id="user-menu" fixedRightPosition>
          <HDSHeader.LogoutSubmenuButton
            label="Log out"
            errorLabel="Logout failed!"
            errorText="Redirection to the OIDC server failed. Try again!"
            errorCloseAriaLabel="Close this error notification"
            id="logout-button"
            loggingOutText="Logging out"
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
