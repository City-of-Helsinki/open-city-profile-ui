import React from 'react';
import { User } from 'oidc-client-ts';
import { act, cleanup } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  waitForElementAttributeValue,
} from '../../../../common/test/testingLibraryTools';
import { ProfileData } from '../../../../graphql/typings';
import CreateProfile from '../CreateProfile';
import {
  MockedResponse,
  resetApolloMocks,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import {
  CountryCallingCodeOption,
  getDefaultCountryCallingCode,
  getCountryCallingCodes,
} from '../../../../i18n/countryCallingCodes.utils';
import { submitCreateProfileForm } from '../../../../common/test/commonUiActions';
import { mockProfileCreator } from '../../../../common/test/userMocking';
describe('<CreateProfile />', () => {
  const tunnistamoUser = ({
    profile: mockProfileCreator(),
    access_token: 'huuhaa',
    expired: false,
  } as unknown) as User;

  const renderTestSuite = (respondWithError = false) => {
    // using 'updatedProfileData' or otherwise profileData is considered to exist.
    const responses: MockedResponse[] = [
      respondWithError
        ? { errorType: 'graphQLError' }
        : { updatedProfileData: ({ id: null } as unknown) as ProfileData },
    ];
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <React.Fragment>
        <CreateProfile
          tunnistamoUser={tunnistamoUser}
          onProfileCreated={vi.fn()}
        />
      </React.Fragment>
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    resetApolloMocks();
  });

  it('is auto-filled with user data', async () => {
    await act(async () => {
      const { getTextOrInputValue } = await renderTestSuite();
      await expect(
        getTextOrInputValue({ id: 'create-profile-firstName' })
      ).resolves.toBe(tunnistamoUser.profile.given_name);
      await expect(
        getTextOrInputValue({ id: 'create-profile-lastName' })
      ).resolves.toBe(tunnistamoUser.profile.family_name);
      await expect(
        getTextOrInputValue({ id: 'create-profile-email' })
      ).resolves.toBe(tunnistamoUser.profile.email);
    });
  });
  it('require first and last name', async () => {
    await act(async () => {
      const testTools = await renderTestSuite();
      const { setInputValue, waitForElement } = testTools;
      await setInputValue({
        selector: { id: 'create-profile-firstName' },
        newValue: '',
      });
      await setInputValue({
        selector: { id: 'create-profile-lastName' },
        newValue: '',
      });
      await submitCreateProfileForm(testTools);
      await waitForElement({ id: 'create-profile-firstName-error' });
      await waitForElement({ id: 'create-profile-lastName-error' });
    });
  });
  it(`Setting a phone number without a country calling code shows an error after submit.
      Setting a country calling code removes the error`, async () => {
    await act(async () => {
      const testTools = await renderTestSuite();
      const {
        setInputValue,
        getElement,
        comboBoxSelector,
        waitForElement,
      } = testTools;
      await setInputValue({
        selector: {
          id: `create-profile-number`,
        },
        newValue: '123456',
      });
      await comboBoxSelector('create-profile-countryCallingCode', '');
      await submitCreateProfileForm(testTools);
      await waitForElement({ id: 'create-profile-countryCallingCode-error' });
      await waitForElementAttributeValue(
        () => getElement({ id: 'create-profile-countryCallingCode-input' }),
        'aria-invalid',
        true
      );

      const defaultCountryCallingCode = getDefaultCountryCallingCode();
      const defaultCountryCallingCodeOption = getCountryCallingCodes('fi').find(
        option => option.value === defaultCountryCallingCode
      ) as CountryCallingCodeOption;

      await comboBoxSelector(
        'create-profile-countryCallingCode',
        defaultCountryCallingCodeOption.label
      );
      await waitForElementAttributeValue(
        () => getElement({ id: 'create-profile-countryCallingCode-input' }),
        'aria-invalid',
        false
      );
    });
  });
  it(`shows an error toast when submit fails.`, async () => {
    await act(async () => {
      const testTools = await renderTestSuite(true);
      const { setInputValue, waitForElement } = testTools;
      await setInputValue({
        selector: {
          id: `create-profile-number`,
        },
        newValue: '123456',
      });
      await submitCreateProfileForm(testTools);
      await waitForElement({ testId: 'mock-toast-type-error' });
    });
  });
});
