import { DocumentNode, Reference, TypedDocumentNode } from '@apollo/client';
import { loader } from 'graphql.macro';

import graphqlClient from './client';

type GraphQlQuery = DocumentNode | TypedDocumentNode;

const SERVICE_CONNECTIONS = loader(
  '../profile/graphql/ServiceConnectionsQuery.graphql'
);

export function clearCache({
  query,
  fieldName,
  variables,
}: {
  query: GraphQlQuery;
  fieldName?: string;
  variables?: unknown;
}): void {
  const cached = graphqlClient.readQuery({
    query,
    variables,
  });

  if (!cached) {
    return;
  }

  const cache = graphqlClient.cache;
  const id = cache.identify((cached.myProfile as unknown) as Reference);
  if (id) {
    cache.evict({
      id,
      fieldName,
    });
  }
}

export function clearServiceConnectionCache(): void {
  clearCache({
    query: SERVICE_CONNECTIONS,
    fieldName: 'serviceConnections',
  });
}
