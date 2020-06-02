import {
  EmailType,
  MyProfileQuery,
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
  {
    email: 'kolmas@testi.fi',
    primary: false,
    emailType: EmailType.OTHER,
    id: '234',
    __typename: 'EmailNode',
  },
];

const getMyProfileQuery = (variables?: MyProfileQuery) => {
  return {
    myProfile: {
      firstName: 'Teemu',
      lastName: 'Testaaja',
      primaryEmail: {
        email: 'ensimmainen@testi.fi',
        primary: true,
        id: '123',
        __typename: 'EmailNode',
      },
      emails: {
        edges: [
          {
            node: {
              email: 'toinen@testi.fi',
              primary: false,
              emailType: EmailType.OTHER,
              id: '',
              __typename: 'EmailNode',
            },
            __typename: 'EmailNodeEdge',
          },
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

      __typename: 'ProfileNode',
      ...variables?.myProfile,
    },
  } as MyProfileQuery;
};

describe('test getEmails function', () => {
  test('add and update arrays are formed correctly', () => {
    const emailObj = getEmail(emails);

    expect(emailObj.addEmails.length).toEqual(1);
    expect(emailObj.updateEmails.length).toEqual(2);
  });

  test('add array is null', () => {
    const emailObj = getEmail([{ ...emails[0] }]);
    expect(emailObj.addEmails).toEqual([null]);
  });

  test('removeEmails field doesnt exist', () => {
    const myProfile = getMyProfileQuery();
    const emailObj = getEmail(emails, myProfile);
    expect(emailObj.removeEmails).toBeFalsy();
  });

  test('removeEmails exists', () => {
    const myProfile = getMyProfileQuery();
    const emailObj = getEmail([{ ...emails[0] }], myProfile);
    expect(emailObj.removeEmails).toEqual(['234']);
  });
});
