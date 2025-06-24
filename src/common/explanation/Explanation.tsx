import React from 'react';
import classNames from 'classnames';

import styles from './Explanation.module.css';
import { usePageLoadFocusSetter } from '../../profile/hooks/usePageLoadFocusSetter';
import FocusableH1 from '../focusableH1/FocusableH1';

type Props = {
  heading: string;
  text: string | React.ReactNode;
  className?: string;
  dataTestId?: string;
  useHeadingHeroStyle?: boolean;
};

function Explanation({
  className,
  heading,
  text,
  dataTestId,
  useHeadingHeroStyle,
}: Props): React.ReactElement {
  usePageLoadFocusSetter();
  return (
    <div
      className={classNames(styles.container, className)}
      {...(dataTestId ? { 'data-testid': dataTestId } : undefined)}
    >
      <FocusableH1 useHeroStyle={useHeadingHeroStyle}>{heading}</FocusableH1>
      <p>{text}</p>
    </div>
  );
}

export default Explanation;
