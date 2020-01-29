import {
  ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service as Service,
  ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges_node as Node,
} from '../../graphql/generatedTypes';

export default function getAllowedDataFieldsFromService(service: Service) {
  return service.allowedDataFields.edges
    .map(edge => {
      if (edge?.node) {
        return edge.node;
      }
      return false;
    })
    .filter((node): node is Node => Boolean(node));
}
