import React from 'react';

import { ServiceConnectionsRoot } from '../../../../graphql/typings';
import getServices from '../../../helpers/getServices';

export type Props = {
  description: string;
  data?: ServiceConnectionsRoot;
};

function DeleteProfileContent({
  data,
  description,
}: Props): React.ReactElement | null {
  const servicesArray = getServices(data);
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
