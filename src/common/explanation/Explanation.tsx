import React from 'react';
import classNames from 'classnames';

import styles from './Explanation.module.css';

type Props = {
  heading: string;
  text: string;
  className?: string;
  titleVariant?: 'h2' | 'h3';
};

function Explanation({
  className,
  heading,
  text,
  titleVariant = 'h2',
}: Props): React.ReactElement {
  const HeadingTagName = `${
    titleVariant
    // eslint-disable-next-line no-undef
  }` as keyof JSX.IntrinsicElements;

  return (
    <div className={classNames(styles.container, className)}>
      <HeadingTagName>{heading}</HeadingTagName>
      <p>{text}</p>
    </div>
  );
}

export default Explanation;
