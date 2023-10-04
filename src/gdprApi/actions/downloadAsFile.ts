import FileSaver from 'file-saver';

import {
  ActionExecutor,
  ActionProps,
} from '../../common/actionQueue/actionQueue';
import { getDownloadDataResult } from './getDownloadData';

const downloadAsFile = 'downloadAsFile';

const downloadAsFileExecutor: ActionExecutor = async (
  action,
  queueController
) => {
  const data = getDownloadDataResult(queueController);
  if (!data) {
    return Promise.reject('No profile data');
  } else {
    const blob = new Blob([data as BlobPart], {
      type: 'application/json',
    });
    try {
      FileSaver.saveAs(blob, 'helsinkiprofile_data.json');
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  }
};

export const downloadAsFileAction: ActionProps = {
  type: downloadAsFile,
  executor: downloadAsFileExecutor,
};
