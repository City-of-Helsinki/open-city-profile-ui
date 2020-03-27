import {
  ServiceConnectionsQuery,
  ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service as Service,
  ServiceType,
} from '../../graphql/generatedTypes';

export default function getServiceTypes(data?: ServiceConnectionsQuery) {
  if (data?.myProfile?.serviceConnections) {
    return data.myProfile.serviceConnections.edges
      .map(edge => {
        if (
          edge?.node?.service &&
          edge?.node?.service?.type !== ServiceType.HKI_MY_DATA
        ) {
          return edge.node.service;
        }
        return false;
      })
      .filter((service): service is Service => Boolean(service));
  }
  return [];
}
