import {
  AddressType,
  EmailType,
  Language,
  UpdateMyProfileVariables,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  MyProfileQuery_myProfile_phones_edges_node as Phone,
  PhoneType,
} from '../../../graphql/generatedTypes';
import { FormValues } from '../../components/editProfileForm/EditProfileForm';
import { updateMutationVariables } from '../updateMutationVariables';
import { myProfile } from '../../../common/test/myProfileQueryData';

const emails: Email[] = [
  {
    email: 'ensimmainen@testi.fi',
    emailType: EmailType.OTHER,
    id: '123',
    primary: true,
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
    __typename: 'EmailNode',
  },
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

const phones: Phone[] = [
  {
    id: '123',
    phone: '0501234567',
    phoneType: PhoneType.OTHER,
    primary: true,
    __typename: 'PhoneNode',
  },
  {
    id: '',
    phone: '0507654321',
    phoneType: PhoneType.OTHER,
    primary: false,
    __typename: 'PhoneNode',
  },
  {
    id: '234',
    phone: '0505472568',
    phoneType: PhoneType.OTHER,
    primary: false,
    __typename: 'PhoneNode',
  },
];

const formValues: FormValues = {
  firstName: 'Teemu',
  lastName: 'Testaaja',
  profileLanguage: Language.FINNISH,
  primaryEmail: {
    email: 'ensimmainen@testi.fi',
    primary: true,
    id: '123',
    emailType: EmailType.OTHER,
    __typename: 'EmailNode',
  },
  emails: emails,
  phones: phones,
  primaryPhone: {
    id: '123',
    phone: '0501234567',
    phoneType: PhoneType.OTHER,
    primary: true,
    __typename: 'PhoneNode',
  },
  addresses: addresses,
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
};

test('add arrays are formed correctly', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    formValues,
    myProfile
  );

  expect(variables.input.profile.addAddresses).toEqual([
    {
      address: 'Testikatu 66',
      postalCode: '00000',
      city: 'Helsinki',
      countryCode: 'FI',
      primary: false,
      addressType: 'OTHER',
    },
  ]);

  expect(variables.input.profile.addEmails).toEqual([
    { email: 'toinen@testi.fi', emailType: 'OTHER', primary: false },
  ]);

  expect(variables.input.profile.addPhones).toEqual([
    { phone: '0507654321', primary: false, phoneType: 'OTHER' },
  ]);
});

test('add arrays are empty', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    {
      ...formValues,
      phones: [phones[2]],
      emails: [emails[2]],
      addresses: [addresses[2]],
    },
    myProfile
  );

  expect(variables.input.profile.addPhones).toEqual([]);
  expect(variables.input.profile.addEmails).toEqual([]);
  expect(variables.input.profile.addAddresses).toEqual([]);
});

test('update arrays are formed correctly', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    formValues,
    myProfile
  );

  expect(variables.input.profile.addAddresses).toEqual([
    {
      address: 'Testikatu 66',
      postalCode: '00000',
      city: 'Helsinki',
      countryCode: 'FI',
      primary: false,
      addressType: 'OTHER',
    },
  ]);
  expect(variables.input.profile.updateEmails).toEqual([
    {
      email: 'kolmas@testi.fi',
      id: 'kolmas@testi.fi',
      emailType: 'OTHER',
      primary: false,
    },
  ]);
  expect(variables.input.profile.updatePhones).toEqual([
    {
      id: '234',
      phone: '0505472568',
      primary: false,
      phoneType: 'OTHER',
    },
  ]);
});

test('update arrays are empty', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    {
      ...formValues,
      addresses: [
        addresses[0],
        { ...addresses[1], address: 'Muokkauskatu 55' },
      ],
      emails: [emails[0], { ...emails[1], email: 'test@email.com' }],
      phones: [phones[0], { ...phones[1], phone: '0501234567' }],
    },
    myProfile
  );

  expect(variables.input.profile.updateAddresses).toEqual([]);
  expect(variables.input.profile.updateEmails).toEqual([]);
  expect(variables.input.profile.updatePhones).toEqual([]);
});

test('remove arrays are formed correctly', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    { ...formValues, addresses: [], emails: [], phones: [] },
    myProfile
  );

  expect(variables.input.profile.removeAddresses).toEqual(['123', '234']);
  expect(variables.input.profile.removeEmails).toEqual(['123', '234']);
  expect(variables.input.profile.removePhones).toEqual(['123', '234']);
});

test('remove arrays do not exists', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    formValues,
    myProfile
  );

  expect(variables.input.profile.removeAddresses).toBeFalsy();
  expect(variables.input.profile.removeEmails).toBeFalsy();
  expect(variables.input.profile.removePhones).toBeFalsy();
});
