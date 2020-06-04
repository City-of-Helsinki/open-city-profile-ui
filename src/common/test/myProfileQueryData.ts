import {
  EmailType,
  Language,
  MyProfileQuery,
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
      address: 'Testikatu 55',
      city: 'Helsinki',
      countryCode: 'FI',
      postalCode: '00100',
      __typename: 'AddressNode',
    },
    primaryPhone: {
      id: '123',
      phone: '0501234567',
      __typename: 'PhoneNode',
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
    __typename: 'ProfileNode',
  },
};
