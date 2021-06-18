import React from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

import NewWindowLink, { NewWindowLinkProps } from '../NewWindowLink';
import i18n from '../../../i18n/i18nInit';

describe('<NewWindowLink /> ', () => {
  const renderComponentAndReturnElement = (
    props: NewWindowLinkProps
  ): HTMLElement => {
    const id = 'new-window-link';
    const result = render(
      <I18nextProvider i18n={i18n}>
        <NewWindowLink {...props} id={id} />
      </I18nextProvider>
    );
    return result.container.querySelector(`#${id}`) as HTMLElement;
  };

  const t = i18n.getFixedT('fi');
  const labelTranslation = t('opensInNewWindow');
  const link = 'https://test.com';
  const ariaLabelAttribute = 'aria-label';

  it('renders link-element with given props', async () => {
    const title = 'test title';
    const element = renderComponentAndReturnElement({
      title,
      link,
    });
    const hasIcon = element.innerHTML.includes('<svg');
    expect(element.getAttribute(ariaLabelAttribute)).toEqual(
      `${title}${labelTranslation}`
    );
    expect(element.getAttribute('href')).toEqual(link);
    expect(element.textContent).toEqual(title);
    expect(hasIcon).toBeTruthy();
  });

  it('removes "." from end of title so aria-label do not have double ("..")', async () => {
    const titleWithoutDot = 'the title';
    const titleWithDot = `${titleWithoutDot}.`;
    const element = renderComponentAndReturnElement({
      title: titleWithDot,
      link,
    });
    expect(element.getAttribute(ariaLabelAttribute)).toEqual(
      `${titleWithoutDot}${labelTranslation}`
    );
  });

  it('uses "ariaLabelTitle" as aria-label instead of "title"', async () => {
    const title = 'title prop';
    const ariaLabelTitle = 'ariaLabelTitle prop';
    const element = renderComponentAndReturnElement({
      title,
      link,
      ariaLabelTitle,
    });
    expect(element.getAttribute(ariaLabelAttribute)).toEqual(
      `${ariaLabelTitle}${labelTranslation}`
    );
  });

  it('Aria-label can be overridden with props', async () => {
    const title = 'title prop';
    const ariaLabelTitle = 'ariaLabelTitle prop';
    const ariaLabelOverride = 'real aria-label';
    const element = renderComponentAndReturnElement({
      title,
      link,
      ariaLabelTitle,
      'aria-label': ariaLabelOverride,
    });
    expect(element.getAttribute(ariaLabelAttribute)).toEqual(ariaLabelOverride);
  });

  it('Icon is not rendered when "hideIcon" is set ', async () => {
    const title = 'test with dot. And another title.';
    const element = renderComponentAndReturnElement({
      title,
      link,
      hideIcon: true,
    });
    const hasIcon = element.innerHTML.includes('<svg');
    expect(hasIcon).toBeFalsy();
  });
});
