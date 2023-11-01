import React, { MouseEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
// import { Navigation } from 'hds-react';
import {
  Header as HDS_header,
  LanguageOption,
  Logo,
  logoFi,
  logoSv,
  IconUser,
} from 'hds-react';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import { MAIN_CONTENT_ID } from '../constants';
// import LanguageSwitcher from '../../i18n/components/languageSwitcher/LanguageSwitcher';
// import UserDropdown from './userDropdown/UserDropdown';
// import styles from './Header.module.css';
import { ProfileContext } from '../../profile/context/ProfileContext';
import authService from '../../auth/authService';
// import getLanguageCode from '../helpers/getLanguageCode';

function Header(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const currentPath = location.pathname;

  const { trackEvent } = useMatomo();

  const { getProfile } = useContext(ProfileContext);
  const profilePagePaths = ['/', '/connected-services'];
  const [myProfilePath, connectedServicesPath] = profilePagePaths;
  const isProfilePagePath = profilePagePaths.includes(currentPath);

  const onClick = (path: string, e?: MouseEvent) => {
    e && e.preventDefault();
    history.push(path);
    trackEvent({ category: 'nav', action: `${path} click` });
  };

  const availableLanguages = i18n.options.resources
    ? Object.keys(i18n.options.resources)
    : [];

  const languageLabel = (langCode: string): string => {
    switch (langCode) {
      case 'fi':
        return 'Suomeksi';
      case 'sv':
        return 'På svenska';
      case 'en':
        return 'In English';
      default:
        return 'Suomeksi';
    }
  };

  const languageOptions: LanguageOption[] = availableLanguages.map(
    i18nLang => ({
      value: i18nLang,
      label: languageLabel(i18nLang),
      /* isPrimary: false, */
    })
  );

  const lang = i18n.resolvedLanguage;
  const logoSrcFromLanguage = lang === 'sv' ? logoSv : logoFi;

  const changeLanguageAction = (langCode: string) => {
    if (langCode !== lang) {
      trackEvent({
        category: 'action',
        action: `Language selected ${langCode}`,
      });
      i18n.changeLanguage(langCode);
    }
  };

  const logoutAction = (e?: React.MouseEvent): Promise<void> => {
    e && e.preventDefault();
    trackEvent({ category: 'action', action: 'Log out' });
    return authService.logout();
  };
  // const loginAction = (): Promise<void> => {
  //   trackEvent({ category: 'action', action: 'Log in' });
  //   return authService.login();
  // };

  return (
    <HDS_header
      onDidChangeLanguage={changeLanguageAction}
      languages={languageOptions}
      defaultLanguage={lang}
    >
      <HDS_header.SkipLink
        skipTo={`#${MAIN_CONTENT_ID}`}
        label={t('skipToContent')}
      />
      <HDS_header.ActionBar
        title={t('appName')}
        titleAriaLabel={t('nav.titleAriaLabel')}
        titleHref={myProfilePath}
        logo={<Logo src={logoSrcFromLanguage} alt={t('helsinkiLogo')} />}
        frontPageLabel={t('nav.goToHomePage')}
      >
        <HDS_header.SimpleLanguageOptions languages={languageOptions} />
        <HDS_header.Link label="kekkonen">perkele</HDS_header.Link>
        {!!getProfile() && isProfilePagePath && (
          <HDS_header.ActionBarItem
            label="XXX"
            ariaLabel={t('nav.menuButtonLabel')}
            id="profileMenu"
            icon={<IconUser />}
            closeLabel="XXX"
            closeIcon={<IconUser />}
          >
            {/* <HDS_header.Link
              label={t('nav.signout')}
              onClick={(e: MouseEvent) => logoutAction(e)}
            /> */}
          </HDS_header.ActionBarItem>
        )}
      </HDS_header.ActionBar>
      {!!getProfile() && isProfilePagePath && (
        <HDS_header.NavigationMenu>
          <HDS_header.Link
            active={currentPath === myProfilePath}
            href={myProfilePath}
            label={t('nav.information')}
            onClick={(e: MouseEvent) => onClick(myProfilePath, e)}
          />
          <HDS_header.Link
            active={currentPath === connectedServicesPath}
            href={connectedServicesPath}
            label={t('nav.services')}
            onClick={(e: MouseEvent) => onClick(connectedServicesPath, e)}
          />
        </HDS_header.NavigationMenu>
      )}
    </HDS_header>
    // <Navigation
    //   skipTo={`#${MAIN_CONTENT_ID}`}
    //   skipToContentLabel={t('skipToContent')}
    //   menuToggleAriaLabel={t('nav.menuButtonLabel')}
    //   title={t('appName')}
    //   titleAriaLabel={t('nav.titleAriaLabel')}
    //   className={styles['z-index-fix']}
    //   logoLanguage={logoLanguage}
    //   onTitleClick={() => onClick(myProfilePath)}
    // >
    //   {!!getProfile() && isProfilePagePath && (
    //     <Navigation.Row>
    //       <Navigation.Item
    //         label={t('nav.information')}
    //         href={myProfilePath}
    //         variant="secondary"
    //         onClick={(e: MouseEvent) => onClick(myProfilePath, e)}
    //         active={currentPath === myProfilePath}
    //       />
    //       <Navigation.Item
    //         label={t('nav.services')}
    //         href={connectedServicesPath}
    //         variant="secondary"
    //         onClick={(e: MouseEvent) => onClick(connectedServicesPath, e)}
    //         active={currentPath === connectedServicesPath}
    //       />
    //     </Navigation.Row>
    //   )}
    //   <Navigation.Actions>
    //     <UserDropdown />
    //     <LanguageSwitcher />
    //   </Navigation.Actions>
    // </Navigation>
  );
}

export default Header;
