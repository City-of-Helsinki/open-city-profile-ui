import { ServiceConnectionsRoot } from '../graphql/typings';

interface GdprServiceConnectionFields {
  gdprQueryScope: string;
  gdprDeleteScope: string;
}

const servicesSelector = (
  serviceConnectionsQuery: ServiceConnectionsRoot | undefined | null
): GdprServiceConnectionFields[] => {
  if (
    serviceConnectionsQuery === null ||
    serviceConnectionsQuery === undefined
  ) {
    return [];
  }

  const serviceConnections =
    serviceConnectionsQuery.myProfile?.serviceConnections?.edges;

  if (serviceConnections === null || serviceConnections === undefined) {
    return [];
  }

  const services = serviceConnections.map(serviceConnection => {
    const service = serviceConnection?.node?.service;

    if (service === undefined || service === null) {
      return undefined;
    }

    return {
      gdprQueryScope: service.gdprQueryScope,
      gdprDeleteScope: service.gdprDeleteScope,
    };
  });

  return services.filter(
    (service): service is GdprServiceConnectionFields => service !== undefined
  );
};

export function getDeleteScopes(
  serviceConnectionsQuery: ServiceConnectionsRoot | undefined
): string[] {
  const services = servicesSelector(serviceConnectionsQuery);

  return services
    .filter(service => !!service.gdprDeleteScope)
    .map(service => service.gdprDeleteScope);
}

export function getQueryScopes(
  serviceConnectionsQuery: ServiceConnectionsRoot | undefined
): string[] {
  const services = servicesSelector(serviceConnectionsQuery);

  return services
    .filter(service => !!service.gdprQueryScope)
    .map(service => service.gdprQueryScope);
}
