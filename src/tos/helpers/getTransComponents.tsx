import React, { ReactNode } from 'react';

export default function getTransComponents(links: Array<string> = []) {
  return links.map<ReactNode>(link => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a href={link}></a>;
  });
}
