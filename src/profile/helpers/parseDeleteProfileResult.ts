import { GdprDeleteMyProfileMutation } from '../../graphql/generatedTypes';
import { ServiceConnectionData } from './getServiceConnectionData';

export type DeleteResultServiceTitles = ServiceConnectionData['title'][];

export type DeleteResultLists = {
  successful: DeleteResultServiceTitles;
  failures: DeleteResultServiceTitles;
};

export default function parseDeleteProfileResult(
  returnedData?: GdprDeleteMyProfileMutation
): DeleteResultLists {
  const successful: DeleteResultServiceTitles = [];
  const failures: DeleteResultServiceTitles = [];
  const results = returnedData?.deleteMyProfile?.results;
  if (!results) {
    return { successful: [], failures: [] };
  }
  results.forEach(result => {
    if (!result || !result.service || !result.success) {
      failures.push(result && result.service ? result.service.title : null);
    } else {
      successful.push(result.service.title);
    }
  });
  return { failures, successful };
}
