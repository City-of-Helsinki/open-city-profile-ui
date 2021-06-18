import React from 'react';

import NewWindowLink, { NewWindowLinkProps } from './NewWindowLink';

type Props = Pick<NewWindowLinkProps, 'link' | 'ariaLabelTitle' | 'hideIcon'> &
  React.LinkHTMLAttributes<HTMLAnchorElement>;

function NewWindowLinkWithChildrenAsTitle(
  props: Props
): React.ReactElement<HTMLAnchorElement> | null {
  const { children, ...rest } = props;
  const stringChild =
    Array.isArray(children) && typeof children[0] === 'string'
      ? children[0]
      : null;
  const stringChildren =
    !stringChild && typeof children === 'string' ? children : null;
  const title = stringChild || stringChildren;
  return title ? <NewWindowLink title={title} {...rest} /> : null;
}

export default NewWindowLinkWithChildrenAsTitle;
