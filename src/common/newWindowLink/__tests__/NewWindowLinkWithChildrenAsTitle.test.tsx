import React from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

import NewWindowLinkWithChildrenAsTitle from '../NewWindowLinkWithChildrenAsTitle';
import i18n from '../../../i18n/i18nInit';

describe('<NewWindowLinkWithChildrenAsTitle /> ', () => {
  const titleAsChild = 'Title as child';
  const renderComponentAndReturnElement = (): HTMLElement => {
    const id = 'new-window-link-with-children-as-title';
    const result = render(
      <I18nextProvider i18n={i18n}>
        <NewWindowLinkWithChildrenAsTitle link={'https://test.com'} id={id}>
          {titleAsChild}
        </NewWindowLinkWithChildrenAsTitle>
      </I18nextProvider>
    );
    return result.container.querySelector(`#${id}`) as HTMLElement;
  };

  const t = i18n.getFixedT('fi');
  const labelTranslation = t('opensInNewWindow');

  it('renders NewWindowLink where child node is the title', async () => {
    const element = renderComponentAndReturnElement();
    expect(element.getAttribute('aria-label')).toEqual(
      `${titleAsChild}${labelTranslation}`
    );
    expect(element.textContent).toEqual(titleAsChild);
  });
});
