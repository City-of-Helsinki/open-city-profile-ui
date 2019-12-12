import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import { Switch, Route, NavLink } from 'react-router-dom';
import classNames from 'classnames';

import styles from './ViewProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import { NameQuery } from '../../graphql/__generated__/NameQuery';
import PageHeading from '../../../common/pageHeading/PageHeading';
import ProfileInformation from '../profileInformation/ProfileInformation';
import getNicknameOrName from '../../helpers/getNicknameOrName';

const NAME = loader('../../graphql/NameQuery.graphql');

type Props = {};

function ViewProfile(props: Props) {
  const { t } = useTranslation();
  const { data } = useQuery<NameQuery>(NAME);
  return (
    <div className={styles.viewProfile}>
      {data && (
        <>
          <PageHeading
            text={getNicknameOrName(data)}
            className={responsive.maxWidthCentered}
          />
          <nav
            className={classNames(
              styles.profileNav,
              responsive.maxWidthCentered
            )}
          >
            <NavLink
              exact
              to="/"
              className={styles.profileNavLink}
              activeClassName={styles.activeProfileNavLink}
            >
              {t('nav.information')}
            </NavLink>
            <NavLink
              exact
              to="/connected-services"
              className={styles.profileNavLink}
              activeClassName={styles.activeProfileNavLink}
            >
              {t('nav.services')}
            </NavLink>
          </nav>
          <Switch>
            <Route path="/connected-services">services</Route>
            <Route path="/">
              <ProfileInformation />
            </Route>
          </Switch>
        </>
      )}
    </div>
  );
}

export default ViewProfile;
