import React, { MouseEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { Navigation } from 'hds-react';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import { MAIN_CONTENT_ID } from '../constants';
import LanguageSwitcher from '../../i18n/components/languageSwitcher/LanguageSwitcher';
import UserDropdown from './userDropdown/UserDropdown';
import styles from './Header.module.css';
import { ProfileContext } from '../../profile/context/ProfileContext';
import getLanguageCode from '../helpers/getLanguageCode';

function Header(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const currentPath = location.pathname;

  const { trackEvent } = useMatomo();

  const { isComplete } = useContext(ProfileContext);
  const profilePagePaths = ['/', '/connected-services'];
  const [myProfilePath, connectedServicesPath] = profilePagePaths;
  const isProfilePagePath = profilePagePaths.includes(currentPath);

  const onClick = (path: string, e?: MouseEvent) => {
    e && e.preventDefault();
    history.push(path);
    trackEvent({ category: 'nav', action: `${path} click` });
  };

  const lang = getLanguageCode(i18n.languages[0]);
  const logoLanguage = lang === 'sv' ? 'sv' : 'fi';

  return (
    <Navigation
      skipTo={`#${MAIN_CONTENT_ID}`}
      skipToContentLabel={t('skipToContent')}
      menuToggleAriaLabel={t('nav.menuButtonLabel')}
      title={t('appName')}
      titleAriaLabel={t('nav.titleAriaLabel')}
      className={styles['z-index-fix']}
      logoLanguage={logoLanguage}
      onTitleClick={() => onClick(myProfilePath)}
    >
      {isComplete && isProfilePagePath && (
        <Navigation.Row>
          <Navigation.Item
            label={t('nav.information')}
            href={myProfilePath}
            variant="secondary"
            onClick={(e: MouseEvent) => onClick(myProfilePath, e)}
            active={currentPath === myProfilePath}
          />
          <Navigation.Item
            label={t('nav.services')}
            href={connectedServicesPath}
            variant="secondary"
            onClick={(e: MouseEvent) => onClick(connectedServicesPath, e)}
            active={currentPath === connectedServicesPath}
          />
        </Navigation.Row>
      )}
      <Navigation.Actions>
        <UserDropdown />
        <LanguageSwitcher />
      </Navigation.Actions>
    </Navigation>
  );
}

export default Header;
