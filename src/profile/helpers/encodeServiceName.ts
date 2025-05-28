import { Service } from '../../graphql/typings';
import { ServiceConnectionData } from './getServiceConnectionData';

export default function encodeServiceName(service: Service | ServiceConnectionData) {
  return String(service.name).toLowerCase().replace(/[\W]/g, '-');
}
