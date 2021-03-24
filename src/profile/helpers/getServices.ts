import {
  ServiceConnectionsRoot,
  Service,
  ServiceType,
} from '../../graphql/typings';

export default function getServices(data?: ServiceConnectionsRoot): Service[] {
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
