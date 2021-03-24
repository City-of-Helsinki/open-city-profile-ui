import React from 'react';

import VerifiedPersonalInformation from '../VerifiedPersonalInformation';
import { renderProfileContextWrapper } from '../../../../common/test/componentMocking';
import {
  getVerifiedData,
  getMyProfile,
} from '../../../../common/test/myProfileMocking';
import {
  MyProfileQuery,
  MyProfileQuery_myProfile_verifiedPersonalInformation_permanentForeignAddress as PermanentForeignAddress,
  MyProfileQuery_myProfile_verifiedPersonalInformation_permanentAddress as PermanentAddress,
  MyProfileQuery_myProfile_verifiedPersonalInformation_temporaryAddress as TemporaryAddress,
  MyProfileQuery_myProfile_verifiedPersonalInformation as VerifiedPersonalInformationType,
} from '../../../../graphql/generatedTypes';
import { createMockedMyProfileResponse } from '../../../../common/test/graphQLDataMocking';

describe('<VerifiedPersonalInformation />', () => {
  let currentVIP: VerifiedPersonalInformationType;
  const initialMyProfileResponse = createMockedMyProfileResponse(
    getMyProfile()
  );
  const getProfileWithVIP = (
    overrides?: Partial<VerifiedPersonalInformationType>
  ): MyProfileQuery => {
    const myProfile = getMyProfile();
    currentVIP = getVerifiedData(overrides);
    const profileBase = myProfile.myProfile;
    return {
      myProfile: {
        ...profileBase,
        verifiedPersonalInformation: currentVIP,
      },
    } as MyProfileQuery;
  };
  it('should render all given data', async () => {
    const data = getProfileWithVIP();
    const { getElement } = await renderProfileContextWrapper(
      [initialMyProfileResponse],
      <VerifiedPersonalInformation data={data} />
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
    const data = getProfileWithVIP({
      permanentAddress: null,
      temporaryAddress: null,
      permanentForeignAddress: null,
    });
    const { getElement } = await renderProfileContextWrapper(
      [initialMyProfileResponse],
      <VerifiedPersonalInformation data={data} />
    );
    expect(() => getElement({ testId: 'vpi-address-permanent' })).toThrow();
    expect(() => getElement({ testId: 'vpi-address-temporary' })).toThrow();
    expect(() => getElement({ testId: 'vpi-address-foreign' })).toThrow();
  });
});
