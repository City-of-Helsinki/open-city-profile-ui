/* eslint-disable @typescript-eslint/camelcase */
import {
  ServiceConnectionsQuery,
  ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service,
} from '../../graphql/generatedTypes';

export default function getServiceTypes(data?: ServiceConnectionsQuery) {
  if (data?.myProfile?.serviceConnections) {
    return data.myProfile.serviceConnections.edges
      .map(edge => {
        if (edge?.node?.service) {
          return edge.node.service;
        }
        return false;
      })
      .filter(
        (
          service
        ): service is ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service =>
          Boolean(service)
      );
  }
  return [];
}
