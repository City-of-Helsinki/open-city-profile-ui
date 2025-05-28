import { ServiceAllowedFieldsNode } from '../../graphql/typings';
import { ServiceConnectionData } from './getServiceConnectionData';

export default function getAllowedDataFieldsFromService(service: ServiceConnectionData): ServiceAllowedFieldsNode[] {
  return service.allowedDataFields.edges
    .map((edge) => {
      if (edge?.node) {
        return edge.node;
      }
      return false;
    })
    .filter((node): node is ServiceAllowedFieldsNode => Boolean(node));
}
