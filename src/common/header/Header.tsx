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

function Header(): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const currentPath = location.pathname;

  const { trackEvent } = useMatomo();

  const { isComplete } = useContext(ProfileContext);

  const onClick = (path: string, e: MouseEvent) => {
    e.preventDefault();
    history.push(path);
    trackEvent({ category: 'nav', action: `${path} click` });
  };

  return (
    <Navigation
      skipTo={`#${MAIN_CONTENT_ID}`}
      skipToContentLabel={t('skipToContent')}
      menuToggleAriaLabel={t('nav.menuButtonLabel')}
      title={t('appName')}
      className={styles['z-index-fix']}
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
