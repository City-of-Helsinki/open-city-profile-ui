import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
};

function PageMeta(props: Props): React.ReactElement {
  const { title } = props;
  const { i18n } = useTranslation();
  const lastScrolledRef = useRef<string>('');

  useEffect(() => {
    if (lastScrolledRef.current !== title) {
      window.scrollTo(0, 0);
      lastScrolledRef.current = title;
    }
  }, [lastScrolledRef, title]);

  return (
    <Helmet>
      <html lang={i18n.language} />
      <title>{title}</title>
    </Helmet>
  );
}

export default PageMeta;
