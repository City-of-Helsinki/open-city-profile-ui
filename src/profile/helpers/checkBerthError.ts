import { GraphQLError } from 'graphql';

import profileConstants from '../constants/profileConstants';

export default function checkBerthError(errors: Readonly<Array<GraphQLError>>) {
  if (!errors) return false;

  return errors.find(
    error => error?.extensions?.code === profileConstants.BERTH_CONNECTED_ERROR
  );
}
