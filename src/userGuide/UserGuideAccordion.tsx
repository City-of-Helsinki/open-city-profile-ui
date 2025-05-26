import React, { ReactNode } from 'react';
import { Accordion, AccordionProps, AccordionSize } from 'hds-react';

import { useMobile } from '../profile/hooks/useMobile';

type Language = 'en' | 'fi' | 'sv';
interface UserGuideAccordionProps {
  children: ReactNode;
  heading: string;
  id: string;
  language: Language;
}

function UserGuideAccordion({ children, id, heading, language }: UserGuideAccordionProps): React.ReactElement {
  const isMobile = useMobile();

  const accordionStyle = {
    maxWidth: '800px',
    borderTop: 0,
    borderBottom: 1,
    border: 'solid 1px #ffffff',
  };

  const theme = {
    '--background-color': '#F2F2F2',
  };

  const accordionProps: AccordionProps = {
    style: accordionStyle,
    size: isMobile ? AccordionSize.Small : AccordionSize.Large,
    card: true,
    language,
    theme,
  };

  return (
    <Accordion headingLevel={3} id={id} heading={heading} language={language} {...accordionProps}>
      {children}
    </Accordion>
  );
}

export default UserGuideAccordion;
