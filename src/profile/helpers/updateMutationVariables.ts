import { isEqual } from 'lodash';

import {
  FormValues,
  Primary,
} from '../components/editProfileForm/EditProfileForm';
import {
  AddressType,
  CreateAddressInput,
  CreateEmailInput,
  CreatePhoneInput,
  EmailType,
  MyProfileQuery,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  MyProfileQuery_myProfile_phones_edges_node as Phone,
  PhoneType,
  UpdateAddressInput,
  UpdateEmailInput,
  UpdatePhoneInput,
} from '../../graphql/generatedTypes';
import getPhonesFromNode from './getPhonesFromNode';
import getEmailsFromNode from './getEmailsFromNode';
import getAddressesFromNode from './getAddressesFromNode';
import { formConstants } from '../constants/formConstants';

type EmailInputs = {
  addEmails: CreateEmailInput[] | null[];
  updateEmails: UpdateEmailInput[];
  removeEmails?: (string | null)[] | null | undefined;
};

type AddressInputs = {
  addAddresses: CreateAddressInput[];
  updateAddresses: UpdateAddressInput[];
  removeAddresses?: (string | null)[] | null | undefined;
};

type PhoneInputs = {
  addPhones: CreatePhoneInput[];
  updatePhones: UpdatePhoneInput[];
  removePhones?: (string | null)[] | null | undefined;
};

const getPrimaryValue = (primary: Primary, profile?: MyProfileQuery) => {
  const primaryValue = profile?.myProfile && profile.myProfile[primary];
  return primaryValue || { id: '' };
};

// This will return empty object that is the same one that is added
// while editing. Return value is used to determine if user has made any
// modifications to values so we can filter them before saving.
const getEmptyObject = (primary: Primary) => {
  switch (primary) {
    case 'primaryEmail':
      return formConstants.EMPTY_VALUES['emails'];
    case 'primaryAddress':
      return formConstants.EMPTY_VALUES['addresses'];
    case 'primaryPhone':
      return formConstants.EMPTY_VALUES['phones'];
    default:
      return {};
  }
};

const getNodesFromProfile = (primary: Primary, profile?: MyProfileQuery) => {
  switch (primary) {
    case 'primaryPhone':
      return getPhonesFromNode(profile);
    case 'primaryEmail':
      return getEmailsFromNode(profile);
    case 'primaryAddress':
      return getAddressesFromNode(profile);
    default:
      return [];
  }
};

const getObjectFields = (value: Address | Email | Phone) => {
  switch (value.__typename) {
    case 'EmailNode': {
      return {
        email: value.email,
        id: value.email,
        emailType: value.emailType || EmailType.OTHER,
        primary: value.primary,
      };
    }
    case 'AddressNode': {
      return {
        id: value.id,
        address: value.address,
        postalCode: value.postalCode,
        city: value.city,
        countryCode: value.countryCode,
        primary: value.primary,
        addressType: value.addressType || AddressType.OTHER,
      };
    }
    case 'PhoneNode': {
      return {
        id: value.id,
        phone: value.phone,
        primary: value.primary,
        phoneType: value.phoneType || PhoneType.OTHER,
      };
    }
    default:
      return { id: '' };
  }
};

function formMutationArrays<T extends Address | Email | Phone>(
  formValueArray: T[],
  primary: Primary,
  profile?: MyProfileQuery
) {
  const profileValues = [
    getPrimaryValue(primary, profile),
    ...getNodesFromProfile(primary, profile),
  ];

  // Filter empty values (e.g user added new phone and pressed save without typing anything)
  const formValues: T[] = formValueArray.filter(
    value => !isEqual(value, getEmptyObject(primary))
  );

  // Form array that contains values that needs to be updated.
  // Filter values that are not changed.
  const updateValues = formValues
    .filter(value => {
      const profileValue = profileValues.find(
        profileValue => profileValue?.id === value.id
      );

      return value.id && !isEqual(value, profileValue);
    })
    .map(value => getObjectFields(value));

  // From array that contains values that are new
  // Filter values that contain id
  const addValues = formValues
    .filter(value => !value.id)
    .map(value => {
      const val = getObjectFields(value);
      // Sending empty id will cause backend error so we remove it
      delete val.id;
      return val;
    });

  const formValueIDs = formValues.map(value => value.id);

  // Form array that contains values that are to be removed
  // Checks new array against old one. If value is missing from new one, add it to array
  const removeValues = profileValues
    .filter(value => value?.id && !formValueIDs.includes(value.id))
    .map(value => value.id);

  switch (primary) {
    case 'primaryAddress': {
      const addressInputs: AddressInputs = {
        addAddresses: addValues as CreateAddressInput[],
        updateAddresses: updateValues as UpdateAddressInput[],
      };
      if (removeValues.length > 0) addressInputs.removeAddresses = removeValues;
      return addressInputs;
    }
    case 'primaryEmail': {
      const emailInputs: EmailInputs = {
        addEmails: addValues as CreateEmailInput[],
        updateEmails: updateValues as UpdateEmailInput[],
      };
      if (removeValues.length > 0) emailInputs.removeEmails = removeValues;
      return emailInputs;
    }
    case 'primaryPhone': {
      const phoneInputs: PhoneInputs = {
        addPhones: addValues as CreatePhoneInput[],
        updatePhones: updateValues as UpdatePhoneInput[],
      };
      if (removeValues.length > 0) phoneInputs.removePhones = removeValues;
      return phoneInputs;
    }
    default:
      return {};
  }
}

const updateMutationVariables = (
  formValues: FormValues,
  profile?: MyProfileQuery
) => {
  return {
    input: {
      profile: {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        language: formValues.profileLanguage,
        ...formMutationArrays<Address>(
          formValues.addresses,
          'primaryAddress',
          profile
        ),
        ...formMutationArrays<Phone>(
          formValues.phones,
          'primaryPhone',
          profile
        ),
        ...formMutationArrays<Email>(
          formValues.emails,
          'primaryEmail',
          profile
        ),
      },
    },
  };
};

export { formMutationArrays, updateMutationVariables };
