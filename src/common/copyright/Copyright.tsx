import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  className?: string;
};

function Copyright(props: Props) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <span className={props.className}>
      &copy; {t('footer.copyright', { year })} &middot; Helsingin kaupunki
      &middot; {t('footer.reserveRights')} &middot;
    </span>
  );
}

export default Copyright;
