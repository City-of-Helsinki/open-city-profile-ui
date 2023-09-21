import {
  GdprServiceConnectionService,
  GdprServiceConnectionsRoot,
  Service,
  ServiceConnectionsRoot,
} from '../graphql/typings';

interface GdprServiceConnectionFields {
  gdprQueryScope: string;
  gdprDeleteScope: string;
}

function pickServiceGdprScopes(
  service: GdprServiceConnectionService
): GdprServiceConnectionFields {
  return {
    gdprQueryScope: service.gdprQueryScope,
    gdprDeleteScope: service.gdprDeleteScope,
  };
}

function servicesSelector(
  serviceConnectionsQuery:
    | GdprServiceConnectionsRoot
    | ServiceConnectionsRoot
    | undefined
    | null,
  serviceName?: Service['name']
): GdprServiceConnectionService[] {
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

  return serviceConnections
    .map(
      serviceConnection =>
        (serviceConnection?.node?.service as GdprServiceConnectionService) ||
        undefined
    )
    .filter(service => {
      if (serviceName && service && service.name !== serviceName) {
        return undefined;
      }
      return service !== undefined;
    });
}

export function getDeleteScopes(
  serviceConnectionsQuery: GdprServiceConnectionsRoot | undefined,
  serviceName?: Service['name']
): string[] {
  const services = servicesSelector(serviceConnectionsQuery, serviceName).map(
    pickServiceGdprScopes
  );

  return services.map(service => service.gdprDeleteScope);
}

export function getQueryScopes(
  serviceConnectionsQuery: GdprServiceConnectionsRoot | undefined,
  serviceName?: Service['name']
): string[] {
  const services = servicesSelector(serviceConnectionsQuery, serviceName).map(
    pickServiceGdprScopes
  );

  return services.map(service => service.gdprQueryScope);
}

export function getServiceConnectionsServices<T = GdprServiceConnectionService>(
  serviceConnectionsQuery:
    | GdprServiceConnectionsRoot
    | ServiceConnectionsRoot
    | undefined
): T[] {
  return (servicesSelector(serviceConnectionsQuery) as unknown) as T[];
}

export function resolveAuthorizationCodeSources(
  serviceConnectionsQuery: GdprServiceConnectionsRoot | undefined
): { pureKeycloadServices: number; otherServices: number } {
  const returnValue = { pureKeycloadServices: 0, otherServices: 0 };
  servicesSelector(serviceConnectionsQuery).forEach(service => {
    if (service.isPureKeycloak) {
      returnValue.pureKeycloadServices += 1;
    } else {
      returnValue.otherServices += 1;
    }
  });

  return returnValue;
}
