import React from 'react';

import VerifiedPersonalInformation from '../VerifiedPersonalInformation';
import { cleanComponentMocks, renderComponentWithMocksAndContexts } from '../../../../common/test/testingLibraryTools';
import { getVerifiedData, getMyProfile } from '../../../../common/test/myProfileMocking';
import { MockedResponse, ResponseProvider } from '../../../../common/test/MockApolloClientProvider';
import {
  VerifiedPersonalInformation as VerifiedPersonalInformationType,
  PermanentAddress,
  PermanentForeignAddress,
  ProfileData,
} from '../../../../graphql/typings';
import RenderChildrenWhenDataIsComplete from '../../../../common/test/RenderChildrenWhenDataIsComplete';

describe('<VerifiedPersonalInformation />', () => {
  const responses: MockedResponse[] = [];
  const getProfileWithVIP = (verifiedPersonalInformation: VerifiedPersonalInformationType): MockedResponse => {
    const profileData = {
      ...getMyProfile().myProfile,
      verifiedPersonalInformation,
    } as ProfileData;
    return { profileData };
  };
  const responseProvider: ResponseProvider = () => responses.shift() as MockedResponse;

  const initTests = async (verifiedPersonalInformation: VerifiedPersonalInformationType) => {
    responses.push(getProfileWithVIP(verifiedPersonalInformation));
    const testTools = await renderComponentWithMocksAndContexts(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <VerifiedPersonalInformation />
      </RenderChildrenWhenDataIsComplete>,
    );
    await testTools.fetch();
    return testTools;
  };

  beforeEach(() => {
    responses.length = 0;
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  it('should render all given data', async () => {
    const currentVIP = getVerifiedData();
    const { getElement } = await initTests(currentVIP);
    const permanentAddress = currentVIP.permanentAddress as PermanentAddress;
    const permanentForeignAddress = currentVIP.permanentForeignAddress as PermanentForeignAddress;
    const permanentForeignAddressCountryCodeAsText = 'Afganistan';
    expect(!!getElement({ text: currentVIP.firstName })).toBeTruthy();
    expect(!!getElement({ text: currentVIP.lastName })).toBeTruthy();
    expect(!!getElement({ text: currentVIP.givenName })).toBeTruthy();
    expect(!!getElement({ text: currentVIP.nationalIdentificationNumber })).toBeTruthy();
    expect(!!getElement({ testId: 'vpi-address-permanent' })).toBeTruthy();
    expect(!!getElement({ text: permanentAddress.streetAddress })).toBeTruthy();
    expect(!!getElement({ text: permanentAddress.postOffice })).toBeTruthy();
    expect(!!getElement({ text: permanentAddress.postalCode })).toBeTruthy();
    expect(!!getElement({ testId: 'vpi-address-foreign' })).toBeTruthy();
    expect(!!getElement({ text: permanentForeignAddress.additionalAddress })).toBeTruthy();
    expect(!!getElement({ text: permanentForeignAddress.streetAddress })).toBeTruthy();
    expect(!!getElement({ text: permanentForeignAddressCountryCodeAsText })).toBeTruthy();
  });
  it('should not render address blocks if not present in data', async () => {
    const currentVIP = getVerifiedData({
      permanentAddress: null,
      permanentForeignAddress: null,
    });
    const { getElement } = await initTests(currentVIP);
    expect(() => getElement({ testId: 'vpi-address-permanent' })).toThrow();
    expect(() => getElement({ testId: 'vpi-address-foreign' })).toThrow();
  });
});
