import { Link } from 'hds-react';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ServiceConnectionData } from '../../../helpers/getServiceConnectionData';

export type Props = {
  data?: ServiceConnectionData[];
  failedDryRunConnections?: string[];
};

function DeleteProfileContent({
  data,
  failedDryRunConnections,
}: Props): React.ReactElement | null {
  const { t } = useTranslation();
  const servicesArray = data && data.length ? data : [];
  const description = servicesArray.length
    ? t('deleteProfileModal.explanation')
    : t('deleteProfileModal.noServiceExplanation');
  return (
    <>
      <p>{description}</p>
      <Trans
        i18nKey="deleteProfileErrorModal.deleteServiceFromPage"
        components={{
          linkToServices: (
            <Link href={'/connected-services'} size="M">
              {''}
            </Link>
          ),
          linkToServicesText: t('nav.services'),
        }}
      />
      {servicesArray.length ? (
        <ul>
          {servicesArray.map((service, index) => (
            <li key={index}>{service.title}</li>
          ))}
        </ul>
      ) : null}
      {failedDryRunConnections && failedDryRunConnections.length ? (
        <>
          <p>{t('deleteProfileErrorModal.unableToDeleteServices')}</p>
          <ul>
            {failedDryRunConnections.map((info, index) => (
              <li key={index}>{info}</li>
            ))}
          </ul>
          <p>{t('deleteProfileErrorModal.contactServiceToDelete')}</p>
        </>
      ) : null}
    </>
  );
}

export default DeleteProfileContent;
