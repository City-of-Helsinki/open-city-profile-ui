import {
  EmailType,
  MyProfileQuery_myProfile_emails_edges_node as Email,
} from '../../../graphql/generatedTypes';
import { getEmail } from '../updateMutationVariables';

// TODO add tests for getAddress & getEmail after support for multiple entities is added

const emails: Email[] = [
  {
    email: 'ensimmainen@testi.fi',
    primary: true,
    id: '123',
    emailType: EmailType.OTHER,
    __typename: 'EmailNode',
  },
  {
    email: 'toinen@testi.fi',
    primary: false,
    emailType: EmailType.OTHER,
    id: '',
    __typename: 'EmailNode',
  },
];

describe('test getEmails function', () => {
  test('add and update arrays are formed correctly', () => {
    const emailObj = getEmail(emails);

    expect(emailObj.addEmails.length).toEqual(1);
    expect(emailObj.updateEmails.length).toEqual(1);
  });

  test('add array is null', () => {
    const emailObj = getEmail([{ ...emails[0] }]);
    expect(emailObj.addEmails).toEqual([null]);
  });
});
