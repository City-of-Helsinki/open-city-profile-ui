import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import { Switch, Route, NavLink } from 'react-router-dom';
import classNames from 'classnames';

import styles from './ViewProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import PageHeading from '../../../common/pageHeading/PageHeading';
import ProfileInformation from '../profileInformation/ProfileInformation';
import ProfileEditForm, { FormValues } from '../editProfileForm/ProfileEditForm';
import getNicknameOrName from '../../helpers/getNicknameOrName';
import { MyProfileQuery } from '../../graphql/__generated__/MyProfileQuery';

const MY_PROFILE = loader('../../graphql/MyProfileQuery.graphql');


type Props = {};

function ViewProfile(props: Props) {
  const [isEditing, setEditing] = useState(false);
  const { t } = useTranslation();
  const { data, loading } = useQuery<MyProfileQuery>(MY_PROFILE);
  console.log("DATA", data);
  const toggleEditing = () => {
    setEditing(true);
  };

  const handleOnValues = (formValues: FormValues) => {

  };

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
              {!isEditing
                ? (
                <ProfileInformation
                  data={data}
                  loading={loading}
                  isEditing={isEditing}
                  setEditing={toggleEditing}
                />
                )
                : (
                  <ProfileEditForm
                    profile={{
                      firstName: data?.myProfile?.firstName || "",
                      lastName: data?.myProfile?.lastName || "",
                      email: data?.myProfile?.primaryEmail?.email || "",
                      phone: data?.myProfile?.primaryPhone?.phone || "",
                      address: data?.myProfile?.primaryAddress?.address || "",
                      city: data?.myProfile?.primaryAddress?.city || "",
                      postalCode: data?.myProfile?.primaryAddress?.postalCode || "",
                    }}
                    onValues={handleOnValues}
                  />
                )
              }
            </Route>
          </Switch>
        </>
      )}
    </div>
  );
}

export default ViewProfile;
