import React from 'react';
import { act } from '@testing-library/react';

import { getMyProfile } from '../../../../common/test/myProfileMocking';
import {
  renderProfileContextWrapper,
  TestTools,
  RenderChildrenWhenDataIsComplete,
} from '../../../../common/test/componentMocking';
import { ProfileData } from '../../../../graphql/typings';
import BasicData from '../BasicData';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import { BasicDataValue } from '../../../helpers/editData';

describe('<BasicData /> ', () => {
  const renderTestSuite = (responses: MockedResponse[]) => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderProfileContextWrapper(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <BasicData />
      </RenderChildrenWhenDataIsComplete>
    );
  };

  // verify rendered data
  const verifyValues = async (
    getTextOrInputValue: TestTools['getTextOrInputValue'],
    source: Partial<BasicDataValue | ProfileData>
  ) => {
    const { firstName, nickname, lastName } = source;
    await expect(
      getTextOrInputValue({ testId: 'basic-data-firstName-value' })
    ).resolves.toBe(firstName);
    await expect(
      getTextOrInputValue({ testId: 'basic-data-nickname-value' })
    ).resolves.toBe(nickname);
    await expect(
      getTextOrInputValue({ testId: 'basic-data-lastName-value' })
    ).resolves.toBe(lastName);
  };

  it("renders user's names", async () => {
    const responses: MockedResponse[] = [
      { profileData: getMyProfile().myProfile as ProfileData },
    ];

    await act(async () => {
      const { fetch, getTextOrInputValue } = await renderTestSuite(responses);
      await fetch();
      await verifyValues(
        getTextOrInputValue,
        getMyProfile().myProfile as ProfileData
      );
    });
  });
});
