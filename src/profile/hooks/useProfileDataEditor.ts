import { useMemo } from 'react';

import {
  EditData,
  EditDataType,
  createEditorForDataType,
} from '../helpers/editData';
import { useProfileMutations } from './useProfileMutations';

export type ProfileDataEditorReturnType = {
  editDataList: EditData[];
};

export function useProfileDataEditor({
  dataType,
}: {
  dataType: EditDataType;
}): ProfileDataEditorReturnType {
  const { profileData } = useProfileMutations({
    dataType,
  });
  if (!profileData) {
    throw new Error(
      'No profile data for useProfileDataEditor. Hook used before data has been fetched.'
    );
  }
  const { getEditData } = useMemo(
    () => createEditorForDataType(profileData, dataType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    editDataList: getEditData(),
  };
}
