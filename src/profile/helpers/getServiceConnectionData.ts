import { ServiceConnectionsRoot, Service } from '../../graphql/typings';

export type ServiceConnectionData = Pick<Service, 'title' | 'description' | 'allowedDataFields' | 'name'> & {
  connectionCreatedAt: Date;
};

function createServiceConnectionData(service: Service, createdAt: Date): ServiceConnectionData {
  const { title, description, allowedDataFields, name } = service;
  return {
    name,
    title,
    description,
    allowedDataFields,
    connectionCreatedAt: createdAt,
  };
}

export default function getServiceConnectionData(data?: ServiceConnectionsRoot): ServiceConnectionData[] {
  if (data?.myProfile?.serviceConnections) {
    return data.myProfile.serviceConnections.edges
      .map((edge) => {
        if (edge?.node) {
          return createServiceConnectionData(edge.node.service, edge.node.createdAt);
        }
        return false;
      })
      .filter((service): service is ServiceConnectionData => Boolean(service));
  }
  return [];
}
