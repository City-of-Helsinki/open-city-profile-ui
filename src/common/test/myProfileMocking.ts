import { MyProfileQuery_myProfile_verifiedPersonalInformation as VPI } from '../../graphql/generatedTypes';

export const getVerifiedData = (overrides?: Partial<VPI>): VPI => ({
  __typename: 'VerifiedPersonalInformationNode',
  firstName: 'verifiedFirstName',
  lastName: 'verifiedLastName',
  givenName: 'verifiedGivenName',
  nationalIdentificationNumber: 'nationalIdentificationNumber',
  email: 'vip@email.com',
  municipalityOfResidence: 'municipalityOfResidence',
  municipalityOfResidenceNumber: 'municipalityOfResidenceNumber',
  permanentAddress: {
    __typename: 'VerifiedPersonalInformationAddressNode',
    streetAddress: 'permanent.streetAddress',
    postalCode: 'permanent.postalCode',
    postOffice: 'permanent.postOffice',
  },
  temporaryAddress: {
    __typename: 'VerifiedPersonalInformationAddressNode',
    streetAddress: 'temporaryAddress.streetAddress',
    postalCode: 'temporaryAddress.postalCode',
    postOffice: 'temporaryAddress.postOffice',
  },
  permanentForeignAddress: {
    __typename: 'VerifiedPersonalInformationForeignAddressNode',
    streetAddress: 'permanentForeignAddress.streetAddress',
    additionalAddress: 'permanentForeignAddress.additionalAddress',
    countryCode: 'AF',
  },
  ...overrides,
});
