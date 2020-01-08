import { ServiceConnectionQuery } from '../graphql/__generated__/ServiceConnectionQuery';

export const getServiceTypes = (data?: ServiceConnectionQuery) => {
  if (data?.myProfile?.serviceConnections) {
    return data.myProfile.serviceConnections.edges.map(edge => {
      if (edge?.node?.service.type) {
        return edge.node.service.type;
      }
      return false;
    });
  }
  return [];
};
