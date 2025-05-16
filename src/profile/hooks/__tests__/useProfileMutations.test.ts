import React from 'react';
import { waitFor } from '@testing-library/react';
import { RenderHookResult, act } from '@testing-library/react-hooks';
import _ from 'lodash';

import {
  createResultPropertyTracker,
  cleanComponentMocks,
} from '../../../common/test/testingLibraryTools';
import {
  ResponseProvider,
  MockedResponse,
} from '../../../common/test/MockApolloClientProvider';
import {
  getMyProfile,
  cloneProfileAndProvideManipulationFunctions,
  ManipulationFunctions,
} from '../../../common/test/myProfileMocking';
import { UpdateMyProfileMutationVariables } from '../../../graphql/generatedTypes';
import { Language, ProfileData, ProfileRoot } from '../../../graphql/typings';
import getAddressesFromNode from '../../helpers/getAddressesFromNode';
import getEmailsFromNode from '../../helpers/getEmailsFromNode';
import getPhonesFromNode from '../../helpers/getPhonesFromNode';
import { MutationReturnType } from '../useProfileMutations';
import { exposeProfileMutationsHook } from '../../../common/test/exposeHooksForTesting';

describe('useProfileMutations.ts ', () => {
  const updateVariables: (UpdateMyProfileMutationVariables | undefined)[] = [];
  const responses: MockedResponse[] = [];
  let profileManipulator: ManipulationFunctions;
  afterEach(() => {
    cleanComponentMocks();
    responses.length = 0;
    updateVariables.length = 0;
  });
  const responseProvider: ResponseProvider = variables => {
    updateVariables.push(variables as UpdateMyProfileMutationVariables);
    return responses.shift() as MockedResponse;
  };

  type RenderResult = RenderHookResult<
    React.PropsWithChildren<object>,
    MutationReturnType
  > & {
    waitForDataChange: () => Promise<void>;
  };

  const getProfileDataForTracker = (
    mutationsResult: MutationReturnType
  ): string =>
    JSON.stringify((mutationsResult && mutationsResult.profileData) || {});

  const render = (): RenderResult => {
    const renderHookResult = exposeProfileMutationsHook(
      responseProvider,
      'basic-data'
    );
    const [waitForDataChange] = createResultPropertyTracker<MutationReturnType>(
      {
        renderHookResult,
        valuePicker: getProfileDataForTracker,
      }
    );

    return {
      ...renderHookResult,
      waitForDataChange,
    };
  };

  // not using before each, because act() do not work with it.
  const initTests = async (): Promise<RenderResult> => {
    responses.push({
      profileData: getMyProfile().myProfile as ProfileData,
    });
    const renderHookResult = render();
    const { result, waitForDataChange } = renderHookResult;
    await waitForDataChange();
    profileManipulator = cloneProfileAndProvideManipulationFunctions(
      result.current.profileData?.myProfile as ProfileData
    );
    return Promise.resolve(renderHookResult);
  };

  describe('Sends the update query and updates Profile Context via cache', () => {
    it('Basic data and language are found and updated', async () => {
      let profileData;

      await act(async () => {
        const renderHookResult = await initTests();
        const { result } = renderHookResult;
        profileData = (result.current.profileData as ProfileRoot).myProfile;
        expect(profileData?.firstName).toEqual('Teemu');
        expect(profileData?.language).toEqual(Language.FINNISH);

        // create update objects
        const basicData = {
          firstName: 'test-firstName',
          nickname: '',
          lastName: 'test-lastName',
        };
        const additionalInformation = { language: Language.SWEDISH };

        // create graphQL response for the update
        profileManipulator
          .setBasicData(basicData)
          .setAdditionalInformation(additionalInformation);

        // add the graphQL response
        responses.push({
          updatedProfileData: profileManipulator.getProfile(),
        });

        // convert graphQL to formValues and use it in update
        await result.current.update(
          profileManipulator.getFormValues(),
          getMyProfile()
        );

        await waitFor(() => {
          profileData = (result.current.profileData as ProfileRoot).myProfile;
          expect(profileData).toMatchObject(basicData);
          expect(profileData).toMatchObject(additionalInformation);
        });

        // verify variables sent to the server
        const inputVariables = updateVariables[1]?.input.profile;
        expect(inputVariables).toMatchObject(basicData);
        expect(inputVariables).toMatchObject(additionalInformation);
      });
    });
    it('Addresses are found and updated', async () => {
      let profileRoot;
      await act(async () => {
        const renderHookResult = await initTests();
        const { result } = renderHookResult;
        profileRoot = result.current.profileData as ProfileRoot;
        expect(getAddressesFromNode(profileRoot, true)[0].address).toEqual(
          'Testikatu 55'
        );

        // create update objects
        const address0 = {
          id: '123',
          primary: false,
          address: 'test-address',
        };
        const newAddress = {
          id: '456',
          primary: false,
          address: 'new-test-address',
        };

        // create graphQL response for the update
        profileManipulator
          .edit('addresses', address0)
          // primary in address0 is now false, nullify primary
          .setPrimary('addresses', null)
          .remove('addresses', { id: '234' })
          .add('addresses', newAddress);

        // add the graphQL response
        responses.push({
          updatedProfileData: profileManipulator.getProfile(),
        });

        // convert graphQL to formValues and use it in update
        await result.current.update(
          profileManipulator.getFormValues(),
          getMyProfile()
        );

        await waitFor(() => {
          // verify updated data has correct values
          profileRoot = result.current.profileData;
          const addressNodes = getAddressesFromNode(profileRoot, true);
          expect(addressNodes[0]).toMatchObject(address0);
          expect(addressNodes[1]).toMatchObject(newAddress);
          expect(addressNodes[2]).toBeUndefined();
        });

        // verify variables sent to the server
        const inputVariables = updateVariables[1]?.input.profile;
        expect(_.get(inputVariables, 'updateAddresses[0]')).toMatchObject(
          address0
        );
        expect(_.get(inputVariables, 'removeAddresses[0]')).toEqual('234');
        expect(_.get(inputVariables, 'addAddresses[0].address')).toEqual(
          newAddress.address
        );
      });
    });
    it('Emails are found and updated', async () => {
      let profileRoot;
      await act(async () => {
        const renderHookResult = await initTests();
        const { result } = renderHookResult;
        profileRoot = result.current.profileData as ProfileRoot;
        expect(getEmailsFromNode(profileRoot, true)[0].email).toEqual(
          'ensimmainen@testi.fi'
        );

        const newEmail = {
          id: '456',
          primary: true,
          email: 'new-test-email@eee.com',
        };

        // create graphQL response for the update
        profileManipulator
          .remove('emails', { id: '123' })
          // removed 123 was primary, nullify primary
          .setPrimary('emails', null)
          .add('emails', newEmail);

        // add the graphQL response
        responses.push({
          updatedProfileData: profileManipulator.getProfile(),
        });

        // convert graphQL to formValues and use it in update
        await result.current.update(
          profileManipulator.getFormValues(),
          getMyProfile()
        );

        await waitFor(() => {
          // verify updated data has correct values
          profileRoot = result.current.profileData;
          const emailNodes = getEmailsFromNode(profileRoot, true);
          expect(emailNodes[0]).toMatchObject({ id: '234' });
          expect(emailNodes[1]).toMatchObject(newEmail);
          expect(emailNodes[2]).toBeUndefined();
        });

        // verify variables sent to the server
        const inputVariables = updateVariables[1]?.input.profile;
        expect(_.get(inputVariables, 'removeEmails[0]')).toEqual('123');
        expect(_.get(inputVariables, 'updateEmails')).toHaveLength(0);
        expect(_.get(inputVariables, 'addEmails[0].email')).toEqual(
          newEmail.email
        );
      });
    });
    it('Phones are found and updated', async () => {
      let profileRoot;
      await act(async () => {
        const renderHookResult = await initTests();
        const { result } = renderHookResult;
        profileRoot = result.current.profileData as ProfileRoot;
        expect(getPhonesFromNode(profileRoot, true)[0].phone).toEqual(
          '+358501234567'
        );

        // create update objects
        const phone1 = {
          id: '234',
          phone: '000-111-222',
        };

        const newPhone = {
          id: '456',
          phone: '456-456-222',
        };

        // create graphQL response for the update
        profileManipulator
          .edit('phones', phone1)
          .remove('phones', { id: '123' })
          .add('phones', newPhone);

        // add the graphQL response
        responses.push({
          updatedProfileData: profileManipulator.getProfile(),
        });

        // convert graphQL to formValues and use it in update
        await result.current.update(
          profileManipulator.getFormValues(),
          getMyProfile()
        );

        await waitFor(() => {
          // verify updated data has correct values
          profileRoot = result.current.profileData;
          const phoneNodes = getPhonesFromNode(profileRoot, true);
          expect(phoneNodes[0]).toMatchObject(phone1);
          expect(phoneNodes[1]).toMatchObject(newPhone);
          expect(phoneNodes[2]).toBeUndefined();
        });

        // verify variables sent to the server
        const inputVariables = updateVariables[1]?.input.profile;
        expect(_.get(inputVariables, 'updatePhones[0]')).toMatchObject(phone1);
        expect(_.get(inputVariables, 'removePhones[0]')).toEqual('123');
        expect(_.get(inputVariables, 'addPhones[0].phone')).toEqual(
          newPhone.phone
        );
      });
    });
  });
  describe('Handles errors ', () => {
    it('and profile data is not modified after an error occured', async () => {
      await act(async () => {
        const renderHookResult = await initTests();
        const { result } = renderHookResult;

        // add the graphQL response
        responses.push({
          errorType: 'graphQLError',
        });
        const profileDataBeforeUpdate = JSON.stringify(
          result.current.profileData
        );
        profileManipulator.remove('phones', { id: '123' });
        try {
          await result.current.update(
            profileManipulator.getFormValues(),
            getMyProfile()
          );
          expect('this should never run').toBeFalsy();
          // eslint-disable-next-line no-empty
        } catch (e) {}

        expect(JSON.stringify(result.current.profileData)).toEqual(
          profileDataBeforeUpdate
        );
      });
    });
  });
});
