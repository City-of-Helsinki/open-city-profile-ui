import { to } from 'await-to-js';
import FileSaver from 'file-saver';

import { createActionQueueRunner } from '../../../common/actionQueue/actionQueueRunner';
import { Action } from '../../../common/actionQueue/actionQueue';
import { getDownloadDataAction } from '../getDownloadData';
import { downloadAsFileAction } from '../downloadAsFile';
import { getMockCalls } from '../../../common/test/mockHelper';

const mockSaveAs = vi.fn();

vi.spyOn(FileSaver, 'saveAs').mockImplementation(mockSaveAs);

describe('downloadAsFile.ts', () => {
  const storedData = { downloadMyProfile: { profile: 'profile' } };
  const initTests = (noData = false) => {
    const queue = [getDownloadDataAction, downloadAsFileAction];
    const runner = createActionQueueRunner(queue);
    runner.updateActionAndQueue(getDownloadDataAction.type, {
      result: !noData ? storedData : null,
      complete: true,
    });
    return {
      runner,
      getAction: () => runner.getByType(downloadAsFileAction.type) as Action,
      getFileData: (): Blob | undefined => {
        const calls = getMockCalls(mockSaveAs);

        const lastCallArgs = calls[calls.length - 1];
        return lastCallArgs[0];
      },
    };
  };

  it('Creates a file from stored data and resolves "true" when successful.', async () => {
    global.URL.createObjectURL = vi.fn(() => 'https://test.com');
    global.URL.revokeObjectURL = vi.fn();

    const { runner, getAction } = initTests();

    const [, result] = await to(getAction().executor(getAction(), runner));

    expect(result).toBe(true);
  });
  it('Rejects when there is no data', async () => {
    const { runner, getAction } = initTests(true);
    const [error] = await to(getAction().executor(getAction(), runner));
    expect(error).toBeDefined();
  });
  it('File is created from stored data ', async () => {
    global.URL.createObjectURL = vi.fn(() => 'https://test.com');
    global.URL.revokeObjectURL = vi.fn();

    const { runner, getAction, getFileData } = initTests();

    await to(getAction().executor(getAction(), runner));

    const data = getFileData() as Blob;
    // data.text() does not exist in jsDom so cannot compare contents.

    expect(data.size).toBe(
      new Blob([(storedData.downloadMyProfile as unknown) as BlobPart]).size
    );
  });
});
