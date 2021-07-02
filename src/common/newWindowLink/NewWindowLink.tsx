import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconLinkExternal } from 'hds-react';
import classNames from 'classnames';

import styles from './NewWindowLink.module.css';

export type NewWindowLinkProps = {
  link: string;
  title: string;
  ariaLabelTitle?: string;
  hideIcon?: boolean;
} & React.LinkHTMLAttributes<HTMLAnchorElement>;

function NewWindowLink(
  props: NewWindowLinkProps
): React.ReactElement<HTMLAnchorElement> {
  const {
    link,
    title,
    ariaLabelTitle,
    hideIcon,
    children,
    className,
    ...rest
  } = props;
  const { t } = useTranslation();
  const getAriaLabel = () => {
    const titlePart = ariaLabelTitle || title;
    const titleWithoutLastDot =
      titlePart.slice(-1) === '.'
        ? titlePart.substr(0, titlePart.length - 1)
        : titlePart;
    return t('opensInNewWindow', {
      title: titleWithoutLastDot,
    });
  };

  return (
    <a
      href={link}
      aria-label={getAriaLabel()}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames([className, styles.link])}
      {...rest}
    >
      {title}
      {children}
      {!hideIcon && (
        <IconLinkExternal size={'xs'} className={styles.icon} aria-hidden />
      )}
    </a>
  );
}

export default NewWindowLink;
