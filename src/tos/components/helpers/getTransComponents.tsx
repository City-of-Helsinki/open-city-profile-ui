import React, { ReactNode } from 'react';

export default function getTransComponents(links: Array<string> | undefined) {
  if (links === undefined) return [];
  const components: Array<ReactNode> = [];

  links.forEach(link => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    components.push(<a href={link}></a>);
  });
  return components;
}
