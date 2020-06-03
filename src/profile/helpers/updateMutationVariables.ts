import { isEqual } from 'lodash';

import { FormValues } from '../components/editProfileForm/EditProfileForm';
import {
  AddressType,
  CreateEmailInput,
  EmailType,
  MyProfileQuery,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  PhoneType,
  UpdateEmailInput,
} from '../../graphql/generatedTypes';
import getEmailsFromNode from './getEmailsFromNode';

type EmailInputs = {
  addEmails: CreateEmailInput[] | null[];
  updateEmails: UpdateEmailInput[];
  removeEmails?: (string | null)[] | null | undefined;
};

const getAddress = (formValues: FormValues, profile?: MyProfileQuery) => {
  if (profile?.myProfile?.primaryAddress?.id) {
    return {
      updateAddresses: [
        {
          id: profile.myProfile.primaryAddress.id,
          address: formValues.address,
          city: formValues.city,
          postalCode: formValues.postalCode,
          primary: true,
          addressType: AddressType.OTHER,
          countryCode: formValues.countryCode,
        },
      ],
    };
  }

  return {
    addAddresses: [
      formValues.address || formValues.postalCode || formValues.city
        ? {
            address: formValues.address,
            city: formValues.city,
            postalCode: formValues.postalCode,
            primary: true,
            addressType: AddressType.OTHER,
            countryCode: formValues.countryCode,
          }
        : null,
    ],
  };
};
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
        ...getPhone(formValues, profile),
        ...getAddress(formValues, profile),
        ...getEmail(formValues.emails, profile),
      },
    },
  };
};

export { getEmail, updateMutationVariables };
