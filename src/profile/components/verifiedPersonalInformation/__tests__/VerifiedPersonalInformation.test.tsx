import React from 'react';

import VerifiedPersonalInformation from '../VerifiedPersonalInformation';
import { renderProfileContextWrapper } from '../../../../common/test/componentMocking';
import { createMockedMyProfileResponse } from '../../../../common/test/graphQLDataMocking';
import {
  getMyProfile,
  getVerifiedData,
} from '../../../../common/test/myProfileMocking';
import {
  ProfileRoot,
  ProfileData,
  VerifiedPersonalInformation as VerifiedPersonalInformationType,
  Mutable,
  PermanentAddress,
  PermanentForeignAddress,
  TemporaryAddress,
} from '../../../../graphql/typings';

describe('<VerifiedPersonalInformation />', () => {
  let currentVIP: VerifiedPersonalInformationType;
  const getProfileWithVIP = (
    overrides?: Partial<VerifiedPersonalInformationType>
  ): ProfileRoot => {
    currentVIP = getVerifiedData(overrides);
    const profile = getMyProfile();
    (profile.myProfile as Mutable<
      ProfileData
    >).verifiedPersonalInformation = currentVIP;
    return profile;
  };
  it('should render all given data', async () => {
    const initialMyProfileResponse = createMockedMyProfileResponse(
      getProfileWithVIP()
    );
    const { getElement } = await renderProfileContextWrapper(
      [initialMyProfileResponse],
      <VerifiedPersonalInformation />
    );
    const permanentAddress = currentVIP.permanentAddress as PermanentAddress;
    const permanentForeignAddress = currentVIP.permanentForeignAddress as PermanentForeignAddress;
    const temporaryAddress = currentVIP.temporaryAddress as TemporaryAddress;
    const permanentForeignAddressCountryCodeAsText = 'Afganistan';
    expect(!!getElement({ text: currentVIP.firstName })).toBeTruthy();
    expect(!!getElement({ text: currentVIP.lastName })).toBeTruthy();
    expect(!!getElement({ text: currentVIP.givenName })).toBeTruthy();
    expect(
      !!getElement({ text: currentVIP.nationalIdentificationNumber })
    ).toBeTruthy();
    expect(!!getElement({ testId: 'vpi-address-permanent' })).toBeTruthy();
    expect(!!getElement({ text: permanentAddress.streetAddress })).toBeTruthy();
    expect(!!getElement({ text: permanentAddress.postOffice })).toBeTruthy();
    expect(!!getElement({ text: permanentAddress.postalCode })).toBeTruthy();
    expect(!!getElement({ testId: 'vpi-address-temporary' })).toBeTruthy();
    expect(!!getElement({ text: temporaryAddress.streetAddress })).toBeTruthy();
    expect(!!getElement({ text: temporaryAddress.postOffice })).toBeTruthy();
    expect(!!getElement({ text: temporaryAddress.postalCode })).toBeTruthy();
    expect(!!getElement({ testId: 'vpi-address-foreign' })).toBeTruthy();
    expect(
      !!getElement({ text: permanentForeignAddress.additionalAddress })
    ).toBeTruthy();
    expect(
      !!getElement({ text: permanentForeignAddress.streetAddress })
    ).toBeTruthy();
    expect(
      !!getElement({ text: permanentForeignAddressCountryCodeAsText })
    ).toBeTruthy();
  });
  it('should not render address blocks if not present in data', async () => {
    const initialMyProfileResponse = createMockedMyProfileResponse(
      getProfileWithVIP({
        permanentAddress: null,
        temporaryAddress: null,
        permanentForeignAddress: null,
      })
    );
    const { getElement } = await renderProfileContextWrapper(
      [initialMyProfileResponse],
      <VerifiedPersonalInformation />
    );
    expect(() => getElement({ testId: 'vpi-address-permanent' })).toThrow();
    expect(() => getElement({ testId: 'vpi-address-temporary' })).toThrow();
    expect(() => getElement({ testId: 'vpi-address-foreign' })).toThrow();
  });
});
