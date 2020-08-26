import getEmailsFromNode from '../getEmailsFromNode';
import { MyProfileQuery } from '../../../graphql/generatedTypes';
import { myProfile } from '../../../common/test/myProfileQueryData';

test('returns correct array of emails', () => {
  const emails = getEmailsFromNode(myProfile);
  expect(emails).toEqual([
    {
      email: 'test@email.com',
      id: '234',
      primary: false,
      emailType: 'OTHER',
      __typename: 'EmailNode',
    },
  ]);
});

test('emails is empty', () => {
  const emptyEmailProfile = {
    myProfile: {
      ...myProfile.myProfile,
      emails: {
        edges: [],
        __typename: 'EmailNodeConnection',
      },
    },
  };

  const emails = getEmailsFromNode(emptyEmailProfile as MyProfileQuery);
  expect(emails).toEqual([]);
});
