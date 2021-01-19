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

type ClonedObject = Record<string, unknown>;
type ReplacerFunction = (key: string, value: unknown) => unknown;

const JSONReplacer: ReplacerFunction = (
  key: string,
  value: unknown
): unknown => {
  if (key === 'id' && value === '') {
    return undefined;
  }
  return key.indexOf('_') === 0 || key === 'id' ? undefined : value;
};

const cloneObject = <T>(source: T, replacer?: ReplacerFunction): T =>
  JSON.parse(JSON.stringify(source, replacer));

const cloneAndReplace = <T>(source: T): ClonedObject =>
  cloneObject<T>(source, JSONReplacer) as ClonedObject;

const getAddressAsComparisonObject = (source: Address): Partial<Address> =>
  cloneAndReplace<Address>(source);

const getPhoneAsComparisonObject = (source: Phone): Partial<Phone> => {
  const clone = cloneAndReplace<Phone>(source);
  if (source.id) {
    clone.id = source.id;
  }
  return clone;
};

const getEmailAsComparisonObject = (source: Email): Partial<Email> => {
  const clone = cloneAndReplace<Email>(source);
  if (source.email && source.id) {
    clone.id = source.email;
  }
  return clone;
};

const primaryEmail = myProfile.myProfile?.primaryEmail as Email;
const primaryPhone = myProfile.myProfile?.primaryPhone as Phone;
const primaryAddress = myProfile.myProfile?.primaryAddress as Address;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const secondaryAddress = myProfile.myProfile.addresses.edges[0].node as Address;

const emails: Email[] = [
  cloneObject(primaryEmail),
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
  cloneObject(primaryAddress),
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
  cloneObject(secondaryAddress),
];

const phones: Phone[] = [
  cloneObject(primaryPhone),
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
  primaryEmail: cloneObject(emails[0]),
  emails,
  phones,
  primaryPhone: cloneObject(phones[0]),
  addresses,
  primaryAddress: cloneObject(addresses[0]),
};

test('add arrays are formed correctly', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    formValues,
    myProfile
  );

  expect(variables.input.profile.addAddresses).toEqual([
    getAddressAsComparisonObject(addresses[1]),
  ]);

  expect(variables.input.profile.addEmails).toEqual([
    getEmailAsComparisonObject(emails[1]),
  ]);

  expect(variables.input.profile.addPhones).toEqual([
    getPhoneAsComparisonObject(phones[1]),
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
    getAddressAsComparisonObject(addresses[1]),
  ]);
  expect(variables.input.profile.updateEmails).toEqual([
    getEmailAsComparisonObject(emails[2]),
  ]);
  expect(variables.input.profile.updatePhones).toEqual([
    getPhoneAsComparisonObject(phones[2]),
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

  expect(variables.input.profile.removeAddresses).toEqual([
    addresses[0].id,
    addresses[2].id,
  ]);
  expect(variables.input.profile.removeEmails).toEqual([
    emails[0].id,
    emails[2].id,
  ]);
  expect(variables.input.profile.removePhones).toEqual([
    phones[0].id,
    phones[2].id,
  ]);
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
