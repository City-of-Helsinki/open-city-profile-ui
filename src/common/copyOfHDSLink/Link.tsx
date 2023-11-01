/*
  This is a copy of HDS Link component
  It does not support icon replacement or icon hiding

  Additions / changes:
  - added useTranslation
  - added hideIcon prop
  - added iconReplacement prop (icon is rendered if this is set and external is false)
  - default size is "M" instead of "S"
  - icon size is "xs" instead of "s" when size is "M"
  - getTextFromReactChildren -function is copied from own NewWindowLinkWithChildrenAsTitle.tsx.
    The HDS version is not importable
*/
import React from 'react';
import 'hds-core';
import { IconLinkExternal } from 'hds-react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Link.module.css';

export type LinkProps = Omit<
  React.ComponentPropsWithoutRef<'a'>,
  'target' | 'href' | 'onPointerEnterCapture' | 'onPointerLeaveCapture'
> & {
  /**
   * Link content
   */
  children: string;
  /**
   * Boolean indicating whether visited styles of the link are applied
   */
  disableVisitedStyles?: boolean;
  /**
   * Boolean indicating whether the link will lead user to external domain.
   */
  external?: boolean;
  /**
   * Hypertext Reference of the link.
   */
  href: string;
  /**
   * Element placed on the left side of the link text
   */
  iconLeft?: React.ReactNode;
  /**
   * Boolean indicating whether the link will open in new tab or not.
   */
  openInNewTab?: boolean;
  /**
   * Aria label for opening link in a new tab
   */
  openInNewTabAriaLabel?: string;
  /**
   * Aria label for opening link in an external domain
   */
  openInExternalDomainAriaLabel?: string;
  /**
   * Size of the link
   */
  size?: 'S' | 'M' | 'L';
  /**
   * Additional styles
   */
  style?: React.CSSProperties;
  /**
   * hideIcon
   */
  hideIcon?: boolean;
  /**
   * Element placed on the left side of the link text
   */
  iconReplacement?: React.ElementType;
};

type LinkToIconSizeMappingType = {
  L: 'l';
  M: 'xs';
  S: 'xs';
};

export const getTextFromReactChildren = (
  children: string | React.ReactNode
): string | null => {
  const stringChild =
    Array.isArray(children) && typeof children[0] === 'string'
      ? children[0]
      : null;
  const stringChildren =
    !stringChild && typeof children === 'string' ? children : null;
  return stringChild || stringChildren;
};

export const Link = ({
  children,
  className,
  disableVisitedStyles = false,
  external = false,
  href,
  iconLeft,
  openInNewTab = false,
  openInExternalDomainAriaLabel,
  openInNewTabAriaLabel,
  style = {},
  size = 'M',
  hideIcon,
  iconReplacement,
  ...rest
}: LinkProps): React.ReactElement<HTMLAnchorElement> => {
  const { t } = useTranslation();
  const composeAriaLabel = () => {
    let childrenText = getTextFromReactChildren(children);
    const newTabText = openInNewTab
      ? openInNewTabAriaLabel || t('openInNewTabAriaLabel')
      : '';
    const externalText = external
      ? openInExternalDomainAriaLabel || t('openInExternalDomainAriaLabel')
      : '';

    if (childrenText && childrenText.slice(-1) !== '.') {
      childrenText = `${childrenText}.`;
    }

    return [childrenText, newTabText, externalText]
      .filter(text => text)
      .join(' ');
  };

  const mapLinkSizeToExternalIconSize: LinkToIconSizeMappingType = {
    L: 'l',
    M: 'xs',
    S: 'xs',
  };

  const Icon = iconReplacement || IconLinkExternal;
  const renderIcon = !hideIcon && (!!iconReplacement || external);

  return (
    <a
      className={classNames(
        styles.link,
        styles[`link${size}`],
        disableVisitedStyles ? styles.disableVisitedStyles : '',
        className
      )}
      href={href}
      style={style}
      {...(openInNewTab && { target: '_blank', rel: 'noopener' })}
      {...((openInNewTab || external) && { 'aria-label': composeAriaLabel() })}
      {...rest}
    >
      {iconLeft && (
        <span className={styles.iconLeft} aria-hidden="true">
          {iconLeft}
        </span>
      )}
      {children}
      {/* {renderIcon && (
        <Icon
          size={mapLinkSizeToExternalIconSize[size]}
          className={classNames(
            styles.icon,
            size === 'L'
              ? styles.verticalAlignBigIcon
              : styles.verticalAlignSmallOrMediumIcon
          )}
          aria-hidden
        />
      )} */}
    </a>
  );
};
