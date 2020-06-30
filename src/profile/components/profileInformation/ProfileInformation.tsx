import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconPenLine } from 'hds-react';
import countries from 'i18n-iso-countries';
import { loader } from 'graphql.macro';
import * as Sentry from '@sentry/browser';
import FileSaver from 'file-saver';
import { useHistory } from 'react-router';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import getAddress from '../../helpers/getAddress';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import getName from '../../helpers/getName';
import {
  DownloadMyProfileQuery,
  MyProfileQuery,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  MyProfileQuery_myProfile_phones_edges_node as Phone,
} from '../../../graphql/generatedTypes';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import getEmailsFromNode from '../../helpers/getEmailsFromNode';
import getAddressesFromNode from '../../helpers/getAddressesFromNode';
import getPhonesFromNode from '../../helpers/getPhonesFromNode';
import useDownloadProfile from '../../../gdprApi/useDownloadProfile';
import useDeleteProfile from '../../../gdprApi/useDeleteProfile';
import checkBerthError from '../../helpers/checkBerthError';
import BerthErrorModal from '../modals/berthError/BerthErrorModal';
import ProfileInformationAccountManagementLink from './ProfileInformationAccountManagementLink';
import useToast from '../../../toast/useToast';

const ALL_DATA = loader('../../graphql/DownloadMyProfileQuery.graphql');

type Props = {
  loading: boolean;
  data: MyProfileQuery;
  isEditing: boolean;
  setEditing: () => void;
};

function ProfileInformation(props: Props) {
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const { trackEvent } = useMatomo();
  const [berthError, setBerthError] = useState(false);
  const { createToast } = useToast();

  // useDownloadProfile and useDeleteProfile need to be mounted when
  // the page they are on is first rendered. That's why it's sensible to
  // manage them in a component that makes the root of a route.
  const [downloadProfileData, downloadQueryResult] = useDownloadProfile<
    DownloadMyProfileQuery
  >(ALL_DATA, {
    onCompleted: data => {
      const blob = new Blob([data.downloadMyProfile], {
        type: 'application/json',
      });
      FileSaver.saveAs(blob, 'helsinkiprofile_data.json');
    },
    onError: (error: Error) => {
      Sentry.captureException(error);
      createToast({ type: 'error' });
    },
    fetchPolicy: 'network-only',
  });
  const [deleteProfile, deleteProfileResult] = useDeleteProfile({
    onCompleted: data => {
      if (data) {
        trackEvent({ category: 'action', action: 'Delete profile' });
        history.push('/profile-deleted');
      }
    },
    onError: error => {
      if (checkBerthError(error.graphQLErrors)) {
        setBerthError(true);
      } else {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      }
    },
  });

  const isDownloadingProfile = downloadQueryResult.loading;
  const isDeletingProfile = deleteProfileResult.loading;

  const { isEditing, setEditing, loading, data } = props;

  const emails = getEmailsFromNode(data);
  const addresses = getAddressesFromNode(data);
  const phones = getPhonesFromNode(data);

  const getAdditionalAddresses = (address: Address) => {
    const country = countries.getName(
      address.countryCode || 'FI',
      getLanguageCode(getLanguageCode(i18n.languages[0]))
    );
    return [address.address, address.city, address.postalCode, country]
      .filter(addressPart => addressPart)
      .join(', ');
  };

  // Add checks for multiple addresses & phones later
  const showAdditionalInformation =
    emails.length > 0 || addresses.length > 0 || phones.length > 0;
  return (
    <Fragment>
      <ProfileSection
        title={t('profileInformation.personalData')}
        description={t('profileInformation.visibility')}
        titleButton={
          !isEditing && (
            <Button
              variant="supplementary"
              onClick={setEditing}
              iconRight={<IconPenLine />}
              className={styles.edit}
            >
              {t('profileForm.edit')}
            </Button>
          )
        }
      >
        {loading && t('loading')}
        {data && !isEditing && (
          <Fragment>
            <div className={styles.storedInformation}>
              <LabeledValue
                label={t('profileInformation.name')}
                value={getName(data)}
              />
              <LabeledValue
                label={t('profileInformation.address')}
                value={getAddress(data, i18n.languages[0])}
              />
              <LabeledValue
                label={t('profileInformation.phone')}
                value={data.myProfile?.primaryPhone?.phone}
              />
              <LabeledValue
                label={t('profileInformation.email')}
                value={data.myProfile?.primaryEmail?.email}
              />
              <LabeledValue
                label={t('profileForm.language')}
                value={t(`LANGUAGE_OPTIONS.${data.myProfile?.language}`)}
              />
            </div>
            {showAdditionalInformation && (
              <h2 className={styles.title}>
                {t('profileForm.additionalInfo')}
              </h2>
            )}
            {emails.length > 0 && (
              <div className={styles.storedInformation}>
                {emails.map((email: Email, index: number) => (
                  <LabeledValue
                    key={index}
                    label={t('profileInformation.email')}
                    value={email.email}
                  />
                ))}
              </div>
            )}
            {phones.length > 0 && (
              <div className={styles.storedInformation}>
                {phones.map((phone: Phone, index: number) => (
                  <LabeledValue
                    key={index}
                    label={t('profileInformation.phone')}
                    value={phone.phone}
                  />
                ))}
              </div>
            )}
            {addresses.length > 0 && (
              <div className={styles.storedInformation}>
                {addresses.map((address: Address, index: number) => (
                  <LabeledValue
                    key={index}
                    label={t('profileInformation.address')}
                    value={getAdditionalAddresses(address)}
                  />
                ))}
              </div>
            )}
          </Fragment>
        )}
      </ProfileSection>
      <div className={styles.boxGrid}>
        <ProfileInformationAccountManagementLink />
        <DownloadData
          isDownloadingData={isDownloadingProfile}
          isOpenByDefault={isDownloadingProfile}
          onDownloadClick={downloadProfileData}
        />
        <DeleteProfile
          onDelete={deleteProfile}
          isOpenByDefault={isDeletingProfile}
        />
      </div>
      <BerthErrorModal
        isOpen={berthError}
        onClose={() => setBerthError(prevState => !prevState)}
      />
    </Fragment>
  );
}

export default ProfileInformation;
