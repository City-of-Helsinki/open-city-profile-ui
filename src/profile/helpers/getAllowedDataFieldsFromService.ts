import { Service, ServiceAllowedFieldsNode } from '../../graphql/typings';

export default function getAllowedDataFieldsFromService(
  service: Service
): ServiceAllowedFieldsNode[] {
  return service.allowedDataFields.edges
    .map(edge => {
      if (edge?.node) {
        return edge.node;
      }
      return false;
    })
    .filter((node): node is ServiceAllowedFieldsNode => Boolean(node));
}
