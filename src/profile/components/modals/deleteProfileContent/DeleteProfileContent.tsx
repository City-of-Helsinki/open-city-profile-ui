import React from 'react';
import { useTranslation } from 'react-i18next';

import { ServiceConnectionsRoot } from '../../../../graphql/typings';
import getServiceConnectionData from '../../../helpers/getServiceConnectionData';

export type Props = {
  data?: ServiceConnectionsRoot;
};

function DeleteProfileContent({ data }: Props): React.ReactElement | null {
  const { t } = useTranslation();
  const servicesArray = getServiceConnectionData(data);
  const description =
    data?.myProfile?.serviceConnections?.edges?.length !== 0
      ? t('deleteProfileModal.explanation')
      : t('deleteProfileModal.noServiceExplanation');
  return (
    <>
      <p>{description}</p>
      {servicesArray.length ? (
        <ul>
          {servicesArray.map((service, index) => (
            <li key={index}>{service.title}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default DeleteProfileContent;
