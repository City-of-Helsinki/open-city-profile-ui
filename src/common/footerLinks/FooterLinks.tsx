import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  className?: string;
};

function FooterLinks(props: Props) {
  return (
    <span className={props.className}>
      {' '}
      <Link to="/#">Rekisteriseloste</Link> |{' '}
      <Link to="/#">Saavutettavuusseloste</Link> |{' '}
      <Link to="/terms-of-service">Käyttöehdot</Link>
    </span>
  );
}

export default FooterLinks;
