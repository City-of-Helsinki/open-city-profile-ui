import React from 'react';
import classNames from 'classnames';

import styles from './Explanation.module.css';

type Props = {
  main: string;
  small?: string;
  className?: string;
  // The explanation content can be with or without a wrapping element.
  // When it is not wrapped, it needs to have its own margin on small
  // screens. When it is wrapped, the containing element usually has a
  // padding that takes care of the whitespace.
  //
  // In this context margin means that the explanation has horizontal
  // margin. Flush means that it does not--that it's flush with the
  // other content on that level of the hierarchy.
  variant?: 'margin' | 'flush';
  // In essence the size of the title.
  titleVariant?: 'h2' | 'h3';
};

function Explanation({
  className,
  main,
  small,
  variant = 'margin',
  titleVariant = 'h3',
}: Props): React.ReactElement {
  const HeadingTagName = `${
    titleVariant ? titleVariant : 'h1'
    // eslint-disable-next-line no-undef
  }` as keyof JSX.IntrinsicElements;

  return (
    <div
      className={classNames(
        styles.container,
        {
          [styles.margin]: variant === 'margin',
          [styles.flush]: variant === 'flush',
        },
        className
      )}
    >
      <HeadingTagName
        className={classNames(styles.main, {
          [styles.h2]: titleVariant === 'h2',
          [styles.h3]: titleVariant === 'h3',
        })}
      >
        {main}
      </HeadingTagName>
      {small && <p className={styles.small}>{small}</p>}
    </div>
  );
}

export default Explanation;
