import { ServiceConnectionsQuery } from '../../graphql/generatedTypes';

export default function getServiceTypes(data?: ServiceConnectionsQuery) {
  if (data?.myProfile?.serviceConnections) {
    return data.myProfile.serviceConnections.edges.map(edge => {
      if (edge?.node?.service.type) {
        return edge.node.service.type;
      }
      return false;
    });
  }
  return [];
}
