import {
  AddressType,
  EmailType,
  Language,
  MyProfileQuery,
  PhoneType,
} from '../../graphql/generatedTypes';

export const myProfile: MyProfileQuery = {
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
    __typename: 'ProfileNode',
  },
};
