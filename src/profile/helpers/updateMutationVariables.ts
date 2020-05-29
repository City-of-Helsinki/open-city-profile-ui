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
const getEmail = (emails: Email[]) => {
  // Map values to get rid of __typeName field (backend won't allow it)
  const updateEmails: UpdateEmailInput[] = emails
    .filter(email => email.id)
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

  return {
    addEmails: addEmails.length > 0 ? addEmails : [null],
    updateEmails,
  };
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
        ...getEmail(formValues.emails),
      },
    },
  };
};

export { getEmail, updateMutationVariables };
