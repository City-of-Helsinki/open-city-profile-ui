import { Link } from 'hds-react';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DeleteResultLists } from '../../helpers/parseDeleteProfileResult';

function DeleteFailureList(
  props: DeleteResultLists
): React.ReactElement | null {
  const { successful, failures } = props;
  const { t } = useTranslation();
  if (!failures.length) {
    return null;
  }
  return (
    <>
      {!!successful.length && (
        <>
          <Trans
            i18nKey="deleteProfileModal.deleteServiceFromPage"
            components={{
              linkToServices: (
                <Link
                  href={'/connected-services'}
                  size="M"
                  data-testid="delete-profile-service-connections-page-link"
                >
                  {''}
                </Link>
              ),
              linkToServicesText: t('nav.services'),
            }}
          />
          <ul data-testid="delete-profile-success-list">
            {successful.map(serviceTitle => (
              <li key={serviceTitle}>{serviceTitle}</li>
            ))}
          </ul>
        </>
      )}

      <p>{t('deleteProfileModal.unableToDeleteServices')}</p>

      <ul data-testid="delete-profile-failure-list">
        {failures.map(serviceTitle => (
          <li key={serviceTitle}>{serviceTitle}</li>
        ))}
      </ul>

      <Trans
        i18nKey="deleteProfileModal.contactServiceToDelete"
        components={{
          linkToExternalServiceList: (
            <Link
              href={t('deleteProfileModal.urlToServiceList')}
              external
              openInNewTab
              size="M"
            >
              {''}
            </Link>
          ),
        }}
      />
    </>
  );
}

export default DeleteFailureList;
