import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';

import LabeledValue from '../../../common/labeledValue/LabeledValue';
import styles from './ProfileInformation.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import Explanation from '../../../common/explanation/Explanation';
import getName from '../../helpers/getName';
import getAddress from '../../helpers/getAddress';
import { MyProfileQuery } from '../../graphql/__generated__/MyProfileQuery';

const MY_PROFILE = loader('../../graphql/MyProfileQuery.graphql');

type Props = {};

function ProfileInformation(props: Props) {
  const { t } = useTranslation();
  const { data, loading } = useQuery<MyProfileQuery>(MY_PROFILE);
  return (
    <div className={styles.profileInformation}>
      <div className={responsive.maxWidthCentered}>
        <h2 className={styles.title}>{t('profileInformation.title')}</h2>
        <section className={styles.personalInformation}>
          <div className={styles.personalInformationTitleRow}>
            <Explanation
              main={t('profileInformation.personalData')}
              small={t('profileInformation.visibility')}
            />
          </div>
          <div className={styles.storedInformation}>
            {loading && t('loading')}
            {data && (
              <>
                <LabeledValue
                  label={t('profileInformation.name')}
                  value={getName(data)}
                />
                <LabeledValue
                  label={t('profileInformation.address')}
                  value={getAddress(data)}
                />
                <LabeledValue
                  label={t('profileInformation.email')}
                  value={data.myProfile?.primaryEmail?.email}
                />
                <LabeledValue
                  label={t('profileInformation.phone')}
                  value={data.myProfile?.primaryPhone?.phone}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfileInformation;
