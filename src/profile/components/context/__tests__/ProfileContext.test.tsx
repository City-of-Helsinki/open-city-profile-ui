import { cleanup } from '@testing-library/react';
import { act, cleanup as cleanupHooks } from '@testing-library/react-hooks';

import { getMyProfile } from '../../../../common/test/myProfileMocking';
import { exposeProfileContext } from '../../../../common/test/componentMocking';
import {
  createMockedMyProfileResponse,
  createUpdateResponse,
} from '../../../../common/test/graphQLDataMocking';

describe('ProfileContext', () => {
  const initialMyProfileResponse = createMockedMyProfileResponse(
    getMyProfile()
  );
  const responseAndVariables = {
    firstName: 'newFirstName',
    lastName: 'newNickname',
    nickname: 'newLastName',
  };
  const updateResponse = createUpdateResponse(
    getMyProfile(),
    responseAndVariables,
    responseAndVariables
  );
  const renderContext = () =>
    exposeProfileContext([initialMyProfileResponse, updateResponse]);

  afterEach(() => {
    cleanup();
    cleanupHooks();
  });

  it('should have no data before fetch is called', async () => {
    const { result } = renderContext();
    const context = result.current;
    expect(context.data).toBeUndefined();
    expect(context.loading).toEqual(false);
    expect(context.isInitialized).toEqual(false);
    expect(context.isComplete).toEqual(false);
    expect(context.updateTime).toEqual(0);
    expect(context.getName()).toEqual('');
  });

  it("after fetch(), context indicates 'loading' state and data update", async () => {
    const { result, waitForUpdate } = renderContext();
    let context = result.current;
    await act(async () => {
      const loadingPromise = waitForUpdate();
      loadingPromise.then(() => {
        context = result.current;
        expect(context.data).toBeUndefined();
        expect(context.loading).toEqual(true);
        expect(context.isInitialized).toEqual(true);
        expect(context.isComplete).toEqual(false);
        expect(context.updateTime).toEqual(0);
        expect(context.getName()).toEqual('');
      });

      context.fetch();
      await loadingPromise;

      const dataLoadedPromise = waitForUpdate();
      dataLoadedPromise.then(() => {
        context = result.current;
        expect(context.data).toBeDefined();
        expect(context.loading).toEqual(false);
        expect(context.isInitialized).toEqual(true);
        expect(context.isComplete).toEqual(true);
        expect(context.updateTime > 0).toEqual(true);
        expect(context.getName()).toEqual('Teemu Testaaja');
        expect(context.getName(true)).toEqual('Teme');
      });
      await dataLoadedPromise;
    });
  });
});
