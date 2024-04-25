/* eslint-disable max-len */
import gql from 'graphql-tag';

export const MY_PROFILE = gql`
  fragment MyProfileQueryVerifiedPersonalInformationPermanentForeignAddress on VerifiedPersonalInformationForeignAddressNode {
    streetAddress
    additionalAddress
    countryCode
  }

  fragment MyProfileQueryVerifiedPersonalInformationPermanentAddress on VerifiedPersonalInformationAddressNode {
    streetAddress
    postalCode
    postOffice
  }

  fragment MyProfileQueryVerifiedPersonalInformation on VerifiedPersonalInformationNode {
    firstName
    lastName
    givenName
    nationalIdentificationNumber
    municipalityOfResidence
    municipalityOfResidenceNumber
    permanentAddress {
      ...MyProfileQueryVerifiedPersonalInformationPermanentAddress
    }
    permanentForeignAddress {
      ...MyProfileQueryVerifiedPersonalInformationPermanentForeignAddress
    }
  }

  fragment MyProfileQueryPrimaryAddress on AddressNode {
    id
    primary
    address
    postalCode
    city
    countryCode
    addressType
  }

  fragment MyProfileQueryPrimaryEmail on EmailNode {
    id
    email
    primary
    emailType
  }

  fragment MyProfileQueryPrimaryPhone on PhoneNode {
    id
    phone
    primary
    phoneType
  }

  fragment MyProfileQueryAddressesEdgesNode on AddressNode {
    primary
    id
    address
    postalCode
    city
    countryCode
    addressType
  }

  fragment MyProfileQueryEmailsEdgesNode on EmailNode {
    primary
    id
    email
    emailType
  }

  fragment MyProfileQueryPhonesEdgesNode on PhoneNode {
    primary
    id
    phone
    phoneType
  }

  fragment MyProfileQueryAddressesEdges on AddressNodeEdge {
    node {
      ...MyProfileQueryAddressesEdgesNode
    }
  }

  fragment MyProfileQueryEmailsEdges on EmailNodeEdge {
    node {
      ...MyProfileQueryEmailsEdgesNode
    }
  }

  fragment MyProfileQueryPhonesEdges on PhoneNodeEdge {
    node {
      ...MyProfileQueryPhonesEdgesNode
    }
  }

  fragment MyProfileQueryAddresses on AddressNodeConnection {
    edges {
      ...MyProfileQueryAddressesEdges
    }
  }

  fragment MyProfileQueryEmails on EmailNodeConnection {
    edges {
      ...MyProfileQueryEmailsEdges
    }
  }

  fragment MyProfileQueryPhones on PhoneNodeConnection {
    edges {
      ...MyProfileQueryPhonesEdges
    }
  }

  fragment MyProfileQuery on ProfileNode {
    id
    firstName
    lastName
    nickname
    language
    primaryAddress {
      ...MyProfileQueryPrimaryAddress
    }
    addresses {
      ...MyProfileQueryAddresses
    }
    primaryEmail {
      ...MyProfileQueryPrimaryEmail
    }
    emails {
      ...MyProfileQueryEmails
    }
    primaryPhone {
      ...MyProfileQueryPrimaryPhone
    }
    phones {
      ...MyProfileQueryPhones
    }
    verifiedPersonalInformation {
      ...MyProfileQueryVerifiedPersonalInformation
    }
  }

  query MyProfile {
    myProfile {
      ...MyProfileQuery
    }
  }
`;
