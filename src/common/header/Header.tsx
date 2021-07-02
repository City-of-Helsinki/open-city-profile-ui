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
      onTitleClick={() => onClick('/')}
    >
      {isComplete && (
        <Navigation.Row>
          <Navigation.Item
            label={t('nav.information')}
            href="/"
            variant="secondary"
            onClick={(e: MouseEvent) => onClick('/', e)}
            active={currentPath === '/'}
          />
          <Navigation.Item
            label={t('nav.services')}
            href="/connected-services"
            variant="secondary"
            onClick={(e: MouseEvent) => onClick('/connected-services', e)}
            active={currentPath === '/connected-services'}
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
