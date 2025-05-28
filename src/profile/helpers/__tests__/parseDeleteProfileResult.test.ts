import { getDeleteMyProfileMutationResult } from '../../../common/test/getDeleteMyProfileMutationResult';
import { GdprDeleteMyProfileMutationDeleteMyProfileFragment } from '../../../graphql/generatedTypes';
import { AnyObject } from '../../../graphql/typings';
import parseDeleteProfileResult from '../parseDeleteProfileResult';

describe('parseDeleteProfileResult', () => {
  it('returns an object with failed and successful service connection deletions', () => {
    const resultFromEmptyResult = parseDeleteProfileResult();
    expect(resultFromEmptyResult.failures).toHaveLength(0);
    expect(resultFromEmptyResult.successful).toHaveLength(0);

    const resultWithNoFailures = parseDeleteProfileResult(getDeleteMyProfileMutationResult());
    expect(resultWithNoFailures.failures).toHaveLength(0);
    expect(resultWithNoFailures.successful).toHaveLength(2);
  });
  it('If result.success is not true, the service is in "failures"-array', () => {
    const resultWithOneFailure = parseDeleteProfileResult(getDeleteMyProfileMutationResult(['', 'error']));
    expect(resultWithOneFailure.failures).toHaveLength(1);
    expect(resultWithOneFailure.successful).toHaveLength(1);
    const resultWithTwoFailures = parseDeleteProfileResult(getDeleteMyProfileMutationResult(['error', 'error']));
    expect(resultWithTwoFailures.failures).toHaveLength(2);
    expect(resultWithTwoFailures.successful).toHaveLength(0);
  });
  it('If result or result.service does not exist, the result is in "failures"-array', () => {
    const profileResult = getDeleteMyProfileMutationResult();
    const results = (profileResult.deleteMyProfile as GdprDeleteMyProfileMutationDeleteMyProfileFragment).results;

    (results[0] as unknown) = null;
    (results[1] as unknown as AnyObject).service = null;

    const resultWithTwoFailures = parseDeleteProfileResult(profileResult);
    expect(resultWithTwoFailures.failures).toHaveLength(2);
    expect(resultWithTwoFailures.successful).toHaveLength(0);
  });
  it('If result.success is true, the service is in "successful"-array', () => {
    const resultWithNoFailures = parseDeleteProfileResult(getDeleteMyProfileMutationResult(['', '']));
    expect(resultWithNoFailures.successful).toHaveLength(2);
    expect(resultWithNoFailures.failures).toHaveLength(0);
  });
});
