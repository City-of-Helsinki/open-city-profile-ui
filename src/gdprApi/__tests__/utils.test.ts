import getMyProfileWithServiceConnections from '../../common/test/getMyProfileWithServiceConnections';
import {
  GdprServiceConnectionsQuery,
  GdprServiceConnectionsQueryMyProfileFragment,
  GdprServiceConnectionsQueryMyProfileServiceConnectionsFragment,
  GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeFragment,
} from '../../graphql/generatedTypes';
import { GdprServiceConnectionService, Mutable } from '../../graphql/typings';
import {
  getDeleteScopes,
  getQueryScopes,
  getServiceConnectionsServices,
} from '../utils';

const profile = getMyProfileWithServiceConnections(
  true
) as GdprServiceConnectionsQuery;
const services = profile.myProfile?.serviceConnections?.edges.map(
  (service) => service?.node?.service
) as GdprServiceConnectionService[];

const createProfileWithCustomServiceConnections = (
  targetProfile: GdprServiceConnectionsQuery,
  customServices: (GdprServiceConnectionService | null)[]
): GdprServiceConnectionsQuery => {
  const clone = JSON.parse(
    JSON.stringify(targetProfile)
  ) as GdprServiceConnectionsQuery;
  const serviceConnections = (
    clone.myProfile as GdprServiceConnectionsQueryMyProfileFragment
  )
    .serviceConnections as Mutable<GdprServiceConnectionsQueryMyProfileServiceConnectionsFragment>;
  serviceConnections.edges = customServices.map((service) => ({
    __typename: 'ServiceConnectionTypeEdge',
    node: {
      __typename: 'ServiceConnectionType',
      service,
    } as GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeFragment,
  }));
  return clone;
};

describe('getServiceConnectionsServices', () => {
  it('returns service connections of the profile', () => {
    expect(getServiceConnectionsServices(profile)).toEqual(
      services.map((service) => service)
    );
  });
  it('filters out service connections without a service', () => {
    const profileWithEmptyServiceConnections =
      createProfileWithCustomServiceConnections(profile, [null]);
    expect(
      getServiceConnectionsServices(profileWithEmptyServiceConnections)
    ).toEqual([]);
  });
  it('returns empty array if profile is undefined', () => {
    expect(getServiceConnectionsServices(undefined)).toEqual([]);
  });
});

describe('getDeleteScopes', () => {
  it("returns delete scopes of profile's service connections", () => {
    expect(getDeleteScopes(profile)).toEqual(
      services.map((service) => service.gdprDeleteScope)
    );
  });
  it('returns one delete scope as an array if service name is given', () => {
    expect(getDeleteScopes(profile, services[1].name)).toEqual([
      services[1].gdprDeleteScope,
    ]);
  });
});

describe('getQueryScopes', () => {
  it("returns query scopes of profile's service connections", () => {
    expect(getQueryScopes(profile)).toEqual(
      services.map((service) => service.gdprQueryScope)
    );
  });
  it('returns one query scope as an array if service name is given', () => {
    expect(getQueryScopes(profile, services[1].name)).toEqual([
      services[1].gdprQueryScope,
    ]);
  });
});
