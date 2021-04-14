import _, { isEqual } from 'lodash';

import {
  CreateAddressInput,
  CreateEmailInput,
  CreatePhoneInput,
  UpdateAddressInput,
  UpdateEmailInput,
  UpdateMyProfileVariables,
  UpdatePhoneInput,
} from '../../graphql/generatedTypes';
import {
  AddressType,
  EmailType,
  PhoneType,
  ProfileRoot,
  AddressNode,
  EmailNode,
  PhoneNode,
} from '../../graphql/typings';
import getPhonesFromNode from './getPhonesFromNode';
import getEmailsFromNode from './getEmailsFromNode';
import getAddressesFromNode from './getAddressesFromNode';
import { formConstants } from '../constants/formConstants';
import { FormValues } from './editData';

type Primary = 'primaryEmail' | 'primaryAddress' | 'primaryPhone';

type EmailInputs = {
  addEmails: CreateEmailInput[] | null[];
  updateEmails: UpdateEmailInput[];
  removeEmails?: (string | null)[] | null;
};

type AddressInputs = {
  addAddresses: CreateAddressInput[];
  updateAddresses: UpdateAddressInput[];
  removeAddresses?: (string | null)[] | null;
};

type PhoneInputs = {
  addPhones: CreatePhoneInput[];
  updatePhones: UpdatePhoneInput[];
  removePhones?: (string | null)[] | null;
};

type CreatePartialProfileUpdateData = (
  formValues: Partial<FormValues>,
  profile?: ProfileRoot
) => UpdateMyProfileVariables;

const getPrimaryValue = (primary: Primary, profile?: ProfileRoot) => {
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

const getNodesFromProfile = (primary: Primary, profile?: ProfileRoot) => {
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

const getObjectFields = (value: AddressNode | EmailNode | PhoneNode) => {
  switch (value.__typename) {
    case 'EmailNode': {
      return {
        id: value.id,
        email: value.email,
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

function formMutationArrays<T extends AddressNode | EmailNode | PhoneNode>(
  formValueArray: T[],
  primary: Primary,
  profile?: ProfileRoot
): Record<string, unknown> {
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
        profileValueItem => profileValueItem?.id === value.id
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
      // @ts-expect-error: Sending empty id will cause backend error so we remove it
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
      if (removeValues.length > 0) {
        addressInputs.removeAddresses = removeValues;
      }
      return addressInputs;
    }
    case 'primaryEmail': {
      const emailInputs: EmailInputs = {
        addEmails: addValues as CreateEmailInput[],
        updateEmails: updateValues as UpdateEmailInput[],
      };
      if (removeValues.length > 0) {
        emailInputs.removeEmails = removeValues;
      }
      return emailInputs;
    }
    case 'primaryPhone': {
      const phoneInputs: PhoneInputs = {
        addPhones: addValues as CreatePhoneInput[],
        updatePhones: updateValues as UpdatePhoneInput[],
      };
      if (removeValues.length > 0) {
        phoneInputs.removePhones = removeValues;
      }
      return phoneInputs;
    }
    default:
      return {};
  }
}

const updateMutationVariables: CreatePartialProfileUpdateData = (
  formValues,
  profile
) => {
  const phoneData = formValues.phones
    ? formMutationArrays<PhoneNode>(formValues.phones, 'primaryPhone', profile)
    : null;
  const emailData = formValues.emails
    ? formMutationArrays<EmailNode>(formValues.emails, 'primaryEmail', profile)
    : null;
  const addressData = formValues.addresses
    ? formMutationArrays<AddressNode>(
        formValues.addresses,
        'primaryAddress',
        profile
      )
    : null;

  const updateNameProps = _.pick(formValues, [
    'firstName',
    'nickname',
    'lastName',
  ]);
  const updateNameCount = Object.keys(updateNameProps).length;

  const userData = updateNameCount > 0 ? updateNameProps : null;
  const additionalInformation = formValues.language
    ? {
        language: formValues.language,
      }
    : null;
  return {
    input: {
      profile: {
        ...userData,
        ...additionalInformation,
        ...phoneData,
        ...emailData,
        ...addressData,
      },
    },
  };
};

export { formMutationArrays, updateMutationVariables };
