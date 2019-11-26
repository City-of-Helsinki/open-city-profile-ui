import React from 'react';

type Props = {
  className?: string;
};

function Copyright(props: Props) {
  const year = new Date().getFullYear();
  return (
    <span className={props.className}>
      &copy; Copyright {year} &middot; Helsingin kaupunki &middot; All rights
      reserved.
    </span>
  );
}

export default Copyright;
