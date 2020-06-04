import {
  EmailType,
  MyProfileQuery,
  MyProfileQuery_myProfile_emails_edges_node as Email,
} from '../../../graphql/generatedTypes';
import { getEmail } from '../updateMutationVariables';
import { myProfile } from '../../../common/test/myProfileQueryData';

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
  {
    email: 'kolmas@testi.fi',
    primary: false,
    emailType: EmailType.OTHER,
    id: '234',
  } as Email,
];

describe('test getEmails function', () => {
  test('add array is formed correctly', () => {
    const emailObj = getEmail(emails);

    expect(emailObj.addEmails.length).toEqual(1);
  });

  test('add array is null', () => {
    const emailObj = getEmail([{ ...emails[0] }]);
    expect(emailObj.addEmails).toEqual([null]);
  });

  test('update array is formed correctly', () => {
    const emailObj = getEmail(emails, myProfile);
    expect(emailObj.updateEmails).toEqual([
      {
        email: 'kolmas@testi.fi',
        emailType: 'OTHER',
        id: '234',
        primary: false,
      },
    ]);
  });

  test('update array is empty (emails & profileEmails are equal)', () => {
    const profileWithSameEmails = {
      myProfile: {
        ...myProfile.myProfile,
        emails: {
          edges: [
            {
              node: {
                email: 'kolmas@testi.fi',
                primary: false,
                emailType: EmailType.OTHER,
                id: '234',
                __typename: 'EmailNode',
              },
              __typename: 'EmailNodeEdge',
            },
          ],
          __typename: 'EmailNodeConnection',
        },
      },
    } as MyProfileQuery;

    const emailObj = getEmail(emails, profileWithSameEmails);
    expect(emailObj.updateEmails).toEqual([]);
  });

  test('removeEmails field doesnt exist', () => {
    const emailObj = getEmail(emails, myProfile);
    expect(emailObj.removeEmails).toBeFalsy();
  });

  test('removeEmails exists', () => {
    const emailObj = getEmail([], myProfile);
    expect(emailObj.removeEmails).toEqual(['123', '234']);
  });
});
