import {
  ServiceConnectionsQuery,
  ServiceType,
} from '../../graphql/generatedTypes';

export default function getServiceTypes(data?: ServiceConnectionsQuery) {
  if (data?.myProfile?.serviceConnections) {
    return data.myProfile.serviceConnections.edges
      .map(edge => {
        if (edge?.node?.service.type) {
          return edge.node.service.type;
        }
        return false;
      })
      .filter((serviceType): serviceType is ServiceType =>
        Boolean(serviceType)
      );
  }
  return [];
}
