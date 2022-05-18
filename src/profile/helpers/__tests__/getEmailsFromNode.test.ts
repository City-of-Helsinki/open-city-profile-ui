import getEmailsFromNode from '../getEmailsFromNode';
import { MyProfileQuery } from '../../../graphql/generatedTypes';
import { getMyProfile } from '../../../common/test/myProfileMocking';

it('returns correct array of emails', () => {
  const emails = getEmailsFromNode(getMyProfile());
  expect(emails).toEqual([
    {
      email: 'test@email.com',
      id: '234',
      primary: false,
      emailType: 'PERSONAL',
      __typename: 'EmailNode',
    },
  ]);
});

it('emails is empty', () => {
  const myProfile = getMyProfile().myProfile;
  const emptyEmailProfile = {
    myProfile: {
      ...myProfile,
      emails: {
        edges: [],
        __typename: 'EmailNodeConnection',
      },
    },
  };

  const emails = getEmailsFromNode(emptyEmailProfile as MyProfileQuery);
  expect(emails).toEqual([]);
});
