import { isEqual } from 'lodash';

import { FormValues } from '../components/editProfileForm/EditProfileForm';
import {
  AddressType,
  CreateAddressInput,
  CreateEmailInput,
  EmailType,
  MyProfileQuery,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  PhoneType,
  UpdateAddressInput,
  UpdateEmailInput,
} from '../../graphql/generatedTypes';
import getEmailsFromNode from './getEmailsFromNode';
import getAddressesFromNode from './getAddressesFromNode';

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

export const getAddress = (addresses: Address[], profile?: MyProfileQuery) => {
  const profileAddresses: Address[] = [
    profile?.myProfile?.primaryAddress as Address,
    ...getAddressesFromNode(profile),
  ];

  const updateAddresses: UpdateAddressInput[] = addresses
    .filter(address => {
      const profileAddress = profileAddresses.find(
        profileAddress => profileAddress?.id === address.id
      );

      return address.id && !isEqual(address, profileAddress);
    })
    .map(address => {
      return {
        id: address.id,
        address: address.address,
        postalCode: address.postalCode,
        city: address.city,
        countryCode: address.countryCode,
        primary: address.primary,
        addressType: address.addressType,
      };
    });

  const addAddresses: CreateAddressInput[] = addresses
    .filter(address => !address.id)
    .map(address => {
      return {
        address: address.address,
        postalCode: address.postalCode,
        city: address.city,
        countryCode: address.countryCode,
        primary: address.primary,
        addressType: address.addressType || AddressType.OTHER,
      };
    });

  const addressIDs = addresses.map(address => address.id);
  const removeAddresses = profileAddresses
    .filter(address => address?.id && !addressIDs.includes(address.id))
    .map(address => address.id);

  const addressInputs: AddressInputs = {
    addAddresses: addAddresses,
    updateAddresses,
  };

  if (removeAddresses.length > 0)
    addressInputs.removeAddresses = removeAddresses;

  return addressInputs;
};

/*
const getPhone = (formValues: FormValues, profile?: MyProfileQuery) => {
  if (profile?.myProfile?.primaryPhone?.id) {
    return {
      updatePhones: [
        {
          phone: formValues.phone,
          primary: true,
          phoneType: PhoneType.OTHER,
          id: profile.myProfile.primaryPhone.id,
        },
      ],
    };
  }

  return {
    addPhones: [
      formValues.phone
        ? {
            phone: formValues.phone,
            primary: true,
            phoneType: PhoneType.OTHER,
          }
        : null,
    ],
  };
};


 */
const getEmail = (emails: Email[], profile?: MyProfileQuery) => {
  const profileEmails: Email[] = [
    profile?.myProfile?.primaryEmail as Email,
    ...getEmailsFromNode(profile),
  ];

  // Compare formValues against profileEmails => filter values that are not changed
  // Map values to get rid of __typeName field (backend won't allow it)
  const updateEmails: UpdateEmailInput[] = emails
    .filter(email => {
      const profileEmail = profileEmails.find(
        profileEmail => profileEmail?.id === email.id
      );

      return email.id && !isEqual(email, profileEmail);
    })
    .map(email => {
      return {
        email: email.email,
        emailType: email.emailType,
        id: email.id,
        primary: email.primary,
      };
    });

  // This needed to be mapped as well, for some reason emailType field in Email & CreateEmailInput
  // are incompatible
  const addEmails: CreateEmailInput[] = emails
    .filter(email => !email.id)
    .map(email => {
      return {
        email: email.email,
        emailType: EmailType.OTHER,
        primary: email.primary,
      };
    });

  const emailIDs = emails.map(email => email.id);

  const removeEmails = profileEmails
    .filter(email => email?.id && !emailIDs.includes(email.id))
    .map(email => email.id);

  const emailInputs: EmailInputs = {
    addEmails: addEmails.length > 0 ? addEmails : [null],
    updateEmails,
  };
  // If there is something to delete, add removeEmails field
  // otherwise we will get backend error.
  if (removeEmails.length > 0) emailInputs.removeEmails = removeEmails;
  return emailInputs;
};

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
        ...getAddress(formValues.addresses, profile),
        ...getEmail(formValues.emails, profile),
      },
    },
  };
};

export { getEmail, updateMutationVariables };
