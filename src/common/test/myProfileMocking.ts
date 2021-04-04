import {
  ProfileRoot,
  AddressType,
  EmailType,
  Language,
  PhoneType,
  VerifiedPersonalInformation,
} from '../../graphql/typings';

export const getMyProfile = (): ProfileRoot => ({
  myProfile: {
    id: 'asd',
    firstName: 'Teemu',
    lastName: 'Testaaja',
    nickname: 'Teme',
    language: Language.FINNISH,
    primaryEmail: {
      email: 'ensimmainen@testi.fi',
      emailType: EmailType.OTHER,
      id: '123',
      primary: true,
      __typename: 'EmailNode',
    },
    primaryAddress: {
      id: '123',
      primary: true,
      address: 'Testikatu 55',
      city: 'Helsinki',
      countryCode: 'FI',
      postalCode: '00100',
      addressType: AddressType.OTHER,
      __typename: 'AddressNode',
    },
    primaryPhone: {
      id: '123',
      phone: '0501234567',
      phoneType: PhoneType.OTHER,
      primary: true,
      __typename: 'PhoneNode',
    },
    addresses: {
      edges: [
        {
          node: {
            id: '234',
            address: 'Muokkauskatu 55',
            city: 'Helsinki',
            countryCode: 'FI',
            postalCode: '12345',
            primary: false,
            addressType: AddressType.OTHER,
            __typename: 'AddressNode',
          },
          __typename: 'AddressNodeEdge',
        },
      ],
      __typename: 'AddressNodeConnection',
    },
    emails: {
      edges: [
        {
          node: {
            id: '234',
            email: 'test@email.com',
            primary: false,
            emailType: EmailType.OTHER,
            __typename: 'EmailNode',
          },
          __typename: 'EmailNodeEdge',
        },
      ],
      __typename: 'EmailNodeConnection',
    },
    phones: {
      edges: [
        {
          node: {
            id: '234',
            phone: '0501234567',
            phoneType: PhoneType.OTHER,
            primary: false,
            __typename: 'PhoneNode',
          },
          __typename: 'PhoneNodeEdge',
        },
      ],
      __typename: 'PhoneNodeConnection',
    },
    verifiedPersonalInformation: null,
    __typename: 'ProfileNode',
  },
});

export const getVerifiedData = (
  overrides?: Partial<VerifiedPersonalInformation>
): VerifiedPersonalInformation => ({
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
