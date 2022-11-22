import { GdprServiceConnectionsRoot, Service } from '../graphql/typings';

interface GdprServiceConnectionFields {
  gdprQueryScope: string;
  gdprDeleteScope: string;
}

const servicesSelector = (
  serviceConnectionsQuery: GdprServiceConnectionsRoot | undefined | null,
  serviceName?: Service['name']
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

    if (serviceName && service.name !== serviceName) {
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
  serviceConnectionsQuery: GdprServiceConnectionsRoot | undefined,
  serviceName?: Service['name']
): string[] {
  const services = servicesSelector(serviceConnectionsQuery, serviceName);

  return services.map(service => service.gdprDeleteScope);
}

export function getQueryScopes(
  serviceConnectionsQuery: GdprServiceConnectionsRoot | undefined,
  serviceName?: Service['name']
): string[] {
  const services = servicesSelector(serviceConnectionsQuery, serviceName);

  return services.map(service => service.gdprQueryScope);
}
