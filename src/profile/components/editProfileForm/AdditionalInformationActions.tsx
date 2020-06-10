import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldArrayRenderProps } from 'formik';

import styles from './EditProfileForm.module.css';

type Props = {
  tDelete: string;
  tPrimary: string;
  index: number;
  arrayHelpers: FieldArrayRenderProps;
  canBeMadePrimary: boolean;
  makePrimary: () => void;
};

const AdditionalInformationActions = ({
  tDelete,
  tPrimary,
  arrayHelpers,
  index,
  canBeMadePrimary,
  makePrimary,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div className={styles.additionalActionsWrapper}>
      <button
        type="button"
        className={styles.additionalActionButton}
        onClick={() => {
          arrayHelpers.remove(index);
        }}
      >
        {t(tDelete)}
      </button>
      {canBeMadePrimary && (
        <Fragment>
          {' | '}
          <button
            type="button"
            className={styles.additionalActionButton}
            onClick={makePrimary}
          >
            {t(tPrimary)}
          </button>
        </Fragment>
      )}
    </div>
  );
};

export default AdditionalInformationActions;
