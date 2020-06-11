import {
  AddressType,
  EmailType,
  MyProfileQuery,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
} from '../../../graphql/generatedTypes';
import { getEmail, getAddress } from '../updateMutationVariables';
import { myProfile } from '../../../common/test/myProfileQueryData';

// TODO add tests for getAddress & getEmail after support for multiple entities is added

const emails: Email[] = [
  {
    email: 'ensimmainen@testi.fi',
    primary: true,
    id: '123',
    emailType: EmailType.OTHER,
    __typename: 'EmailNode',
  },
  {
    email: 'toinen@testi.fi',
    primary: false,
    emailType: EmailType.OTHER,
    id: '',
    __typename: 'EmailNode',
  },
  {
    email: 'kolmas@testi.fi',
    primary: false,
    emailType: EmailType.OTHER,
    id: '234',
  } as Email,
];

const addresses: Address[] = [
  {
    id: '123',
    primary: true,
    address: 'Testikatu 55',
    city: 'Helsinki',
    countryCode: 'FI',
    postalCode: '00100',
    addressType: AddressType.OTHER,
    __typename: 'AddressNode',
  },
  {
    id: '',
    address: 'Testikatu 66',
    city: 'Helsinki',
    countryCode: 'FI',
    postalCode: '00000',
    primary: false,
    addressType: AddressType.OTHER,
    __typename: 'AddressNode',
  },
  {
    id: '234',
    address: 'Muokkauskatu 66',
    city: 'Helsinki',
    countryCode: 'FI',
    postalCode: '12345',
    primary: false,
    addressType: AddressType.OTHER,
    __typename: 'AddressNode',
  },
];

describe('test getEmails function', () => {
  test('add array is formed correctly', () => {
    const emailObj = getEmail(emails);

    expect(emailObj.addEmails.length).toEqual(1);
  });

  test('add array is null', () => {
    const emailObj = getEmail([{ ...emails[0] }]);
    expect(emailObj.addEmails).toEqual([null]);
  });

  test('update array is formed correctly', () => {
    const emailObj = getEmail(emails, myProfile);
    expect(emailObj.updateEmails).toEqual([
      {
        email: 'kolmas@testi.fi',
        emailType: 'OTHER',
        id: '234',
        primary: false,
      },
    ]);
  });

  test('update array is empty (emails & profileEmails are equal)', () => {
    const profileWithSameEmails = {
      myProfile: {
        ...myProfile.myProfile,
        emails: {
          edges: [
            {
              node: {
                email: 'kolmas@testi.fi',
                primary: false,
                emailType: EmailType.OTHER,
                id: '234',
                __typename: 'EmailNode',
              },
              __typename: 'EmailNodeEdge',
            },
          ],
          __typename: 'EmailNodeConnection',
        },
      },
    } as MyProfileQuery;

    const emailObj = getEmail(emails, profileWithSameEmails);
    expect(emailObj.updateEmails).toEqual([]);
  });

  test('removeEmails field doesnt exist', () => {
    const emailObj = getEmail(emails, myProfile);
    expect(emailObj.removeEmails).toBeFalsy();
  });

  test('removeEmails exists', () => {
    const emailObj = getEmail([], myProfile);
    expect(emailObj.removeEmails).toEqual(['123', '234']);
  });
});

describe('tests for getAddress function', () => {
  test('', () => {
    const addressObj = getAddress(addresses);

    expect(addressObj.addAddresses.length).toEqual(1);
  });

  test('add array is null', () => {
    const addressObj = getAddress([{ ...addresses[0] }]);

    expect(addressObj.addAddresses).toEqual([]);
  });

  test('update array is formed correctly', () => {
    const addressObj = getAddress(addresses, myProfile);

    expect(addressObj.updateAddresses).toEqual([
      {
        id: '234',
        address: 'Muokkauskatu 66',
        postalCode: '12345',
        city: 'Helsinki',
        countryCode: 'FI',
        primary: false,
        addressType: 'OTHER',
      },
    ]);
  });

  test('update array is emty', () => {
    const addressesAreSame: Address[] = [
      { ...addresses[0] },
      { ...addresses[1] },
      { ...addresses[2], address: 'Muokkauskatu 55' },
    ];
    const addressObj = getAddress(addressesAreSame, myProfile);
    expect(addressObj.updateAddresses).toEqual([]);
  });

  test('removeAddress field doesnt exist', () => {
    const addressObj = getAddress(addresses, myProfile);
    expect(addressObj.removeAddresses).toBeFalsy();
  });

  test('removeAddress exists', () => {
    const addressObj = getAddress([], myProfile);
    expect(addressObj.removeAddresses).toEqual(['123', '234']);
  });
});
