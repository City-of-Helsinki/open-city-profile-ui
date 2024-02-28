import to from 'await-to-js';

import graphqlClient from '../../graphql/client';
import {
  GdprServiceConnectionService,
  GdprServiceConnectionsRoot,
} from '../../graphql/typings';
import { getServiceConnectionsServices } from '../utils';
import {
  ActionExecutor,
  ActionProps,
  QueueController,
  getData,
} from '../../common/actionQueue/actionQueue';
import { getActionResultAndErrorMessage } from './utils';
import reportErrorsToSentry from '../../common/sentry/reportErrorsToSentry';
import GDPR_SERVICE_CONNECTIONS from '../graphql/GdprServiceConnectionsQuery.graphql';

const serviceConnectionsType = 'serviceConnections';

export const getServiceConnectionsResultAndError = (
  queueController: QueueController
) =>
  getActionResultAndErrorMessage<GdprServiceConnectionService[]>(
    serviceConnectionsType,
    queueController
  );

const serviceConnectionsQueryExecutor: ActionExecutor = async action => {
  const [error, result] = await to(
    graphqlClient.query<GdprServiceConnectionsRoot>({
      query: GDPR_SERVICE_CONNECTIONS,
      fetchPolicy: 'no-cache',
    })
  );
  if (error) {
    reportErrorsToSentry(error);
    return Promise.reject(error);
  }
  if (!result || !result.data) {
    return Promise.reject(
      new Error("'No results in GDPR_SERVICE_CONNECTIONS query")
    );
  }
  return Promise.resolve(
    getServiceConnectionsServices(
      result.data,
      getData(action, 'serviceName') as string
    )
  );
};

export const getServiceConnectionsAction: ActionProps = {
  type: serviceConnectionsType,
  executor: serviceConnectionsQueryExecutor,
  options: {
    noStorage: true,
  },
};

export function createActionForGettingSpecificServiceConnection(
  serviceName: string
): ActionProps {
  return {
    type: serviceConnectionsType,
    executor: serviceConnectionsQueryExecutor,
    options: {
      noStorage: true,
    },
    data: {
      serviceName,
    },
  };
}
