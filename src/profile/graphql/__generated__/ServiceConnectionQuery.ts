/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ServiceType } from "./../../../graphql/__generated__/globalTypes";

// ====================================================
// GraphQL query operation: ServiceConnectionQuery
// ====================================================

export interface ServiceConnectionQuery_myProfile_serviceConnections_edges_node_service {
  readonly __typename: "ServiceNode";
  readonly type: ServiceType | null;
}

export interface ServiceConnectionQuery_myProfile_serviceConnections_edges_node {
  readonly __typename: "ServiceConnectionType";
  readonly service: ServiceConnectionQuery_myProfile_serviceConnections_edges_node_service;
}

export interface ServiceConnectionQuery_myProfile_serviceConnections_edges {
  readonly __typename: "ServiceConnectionTypeEdge";
  /**
   * The item at the end of the edge
   */
  readonly node: ServiceConnectionQuery_myProfile_serviceConnections_edges_node | null;
}

export interface ServiceConnectionQuery_myProfile_serviceConnections {
  readonly __typename: "ServiceConnectionTypeConnection";
  /**
   * Contains the nodes in this connection.
   */
  readonly edges: ReadonlyArray<(ServiceConnectionQuery_myProfile_serviceConnections_edges | null)>;
}

export interface ServiceConnectionQuery_myProfile {
  readonly __typename: "ProfileNode";
  readonly serviceConnections: ServiceConnectionQuery_myProfile_serviceConnections | null;
}

export interface ServiceConnectionQuery {
  readonly myProfile: ServiceConnectionQuery_myProfile | null;
}
