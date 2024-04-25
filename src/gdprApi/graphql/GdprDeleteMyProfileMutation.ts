import gql from 'graphql-tag';

export const DELETE_PROFILE = gql`
  fragment GdprDeleteMyProfileMutationDeleteMyProfileResultsErrors on ServiceConnectionDeletionError {
    code
  }

  fragment GdprDeleteMyProfileMutationDeleteMyProfileResults on ServiceConnectionDeletionResult {
    success
    errors {
      ...GdprDeleteMyProfileMutationDeleteMyProfileResultsErrors
    }
    service {
      name
      title(language: $language)
    }
  }

  fragment GdprDeleteMyProfileMutationDeleteMyProfile on DeleteMyProfileMutationPayload {
    results {
      ...GdprDeleteMyProfileMutationDeleteMyProfileResults
    }
  }

  mutation GdprDeleteMyProfile(
    $input: DeleteMyProfileMutationInput!
    $language: TranslationLanguage!
  ) {
    deleteMyProfile(input: $input) {
      ...GdprDeleteMyProfileMutationDeleteMyProfile
    }
  }
`;
