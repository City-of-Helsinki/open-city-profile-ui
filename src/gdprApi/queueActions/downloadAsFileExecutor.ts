import FileSaver from 'file-saver';

import { DownloadMyProfileQuery } from '../../graphql/generatedTypes';
import {
  ActionExecutor,
  ActionProps,
} from '../../common/actionQueue/actionQueue';
import { downloadProfileDataAction } from './downloadProfileDataExecutor';

export const downloadAsFileExecutor: ActionExecutor = async (
  action,
  queueFunctions
) =>
  new Promise((resolve, reject) => {
    (async () => {
      const data = queueFunctions.getResult(
        downloadProfileDataAction.type
      ) as DownloadMyProfileQuery['downloadMyProfile'];
      if (!data) {
        reject('No profile data');
      } else {
        const blob = new Blob([data], {
          type: 'application/json',
        });
        try {
          FileSaver.saveAs(blob, 'helsinkiprofile_data.json');
          resolve(true);
        } catch (e) {
          reject(e);
        }
      }
    })();
  });

const downloadAsFileActionType = 'downloadAsFile';

export const downloadAsFileAction: ActionProps = {
  type: downloadAsFileActionType,
  executor: downloadAsFileExecutor,
};
