import React from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider, Trans } from 'react-i18next';
import { IconAlertCircle } from 'hds-react';

import { Link, LinkProps } from '../Link';
import i18n from '../../../i18n/i18nInit';

describe('<Link /> ', () => {
  const renderComponentAndReturnElement = (
    props: LinkProps & { isTransTest?: boolean }
  ): HTMLElement => {
    const { children, isTransTest, ...rest } = props;
    const id = 'new-window-link';
    const result = render(
      !isTransTest ? (
        <I18nextProvider i18n={i18n}>
          <Link {...rest} id={id}>
            {children}
          </Link>
        </I18nextProvider>
      ) : (
        <Trans
          defaults={`<0>${children}</0>`}
          components={[
            // eslint-disable-next-line react/jsx-key
            <Link {...rest} id={id}>
              {''}
            </Link>,
          ]}
        />
      )
    );
    return result.container.querySelector(`#${id}`) as HTMLElement;
  };

  const t = i18n.getFixedT('fi');
  const openInNewTabTranslation = t('openInNewTabAriaLabel');
  const externalLinkTranslation = t('openInExternalDomainAriaLabel');
  const href = 'https://test.com';
  const ariaLabelAttribute = 'aria-label';

  it('renders link-element with given props', async () => {
    const title = 'test title';
    const element = renderComponentAndReturnElement({
      children: title,
      href,
      openInNewTab: true,
      external: true,
    });
    const hasIcon = element.innerHTML.includes('<svg');
    expect(element.getAttribute(ariaLabelAttribute)).toEqual(
      `${title}. ${openInNewTabTranslation} ${externalLinkTranslation}`
    );
    expect(element.getAttribute('href')).toEqual(href);
    expect(element.textContent).toEqual(title);
    expect(hasIcon).toBeTruthy();
  });

  it('removes "." from end of title so aria-label do not have double ("..")', async () => {
    const titleWithoutDot = 'the title';
    const titleWithDot = `${titleWithoutDot}.`;
    const element = renderComponentAndReturnElement({
      children: titleWithDot,
      href,
      openInNewTab: true,
    });
    expect(element.getAttribute(ariaLabelAttribute)).toEqual(
      `${titleWithoutDot}. ${openInNewTabTranslation}`
    );
  });

  it('Aria-label can be overridden with props', async () => {
    const title = 'title prop';
    const ariaLabelTitle = 'ariaLabelTitle prop';
    const ariaLabelOverride = 'real aria-label';
    const element = renderComponentAndReturnElement({
      children: title,
      href,
      openInNewTabAriaLabel: ariaLabelTitle,
      openInNewTab: true,
      external: true,
      'aria-label': ariaLabelOverride,
    });
    expect(element.getAttribute(ariaLabelAttribute)).toEqual(ariaLabelOverride);
  });

  it('Icon is not rendered when "hideIcon" is set or "external" is not set', async () => {
    let hasIcon: boolean;
    const elementWithHideIcon = renderComponentAndReturnElement({
      children: 'title',
      href,
      hideIcon: true,
    });
    hasIcon = elementWithHideIcon.innerHTML.includes('<svg');
    expect(hasIcon).toBeFalsy();

    const elementWithoutExternal = renderComponentAndReturnElement({
      children: 'title',
      href,
    });
    hasIcon = elementWithoutExternal.innerHTML.includes('<svg');
    expect(hasIcon).toBeFalsy();
  });

  it('Icon is rendered, if iconReplacement is set', async () => {
    const IconReplacement = () => (
      <div className="icon-replacement">
        <IconAlertCircle />
      </div>
    );
    const element = renderComponentAndReturnElement({
      children: 'title',
      href,
      iconReplacement: IconReplacement,
    });
    const hasReplacement = element.innerHTML.includes('icon-replacement');
    expect(hasReplacement).toBeTruthy();
  });

  it('can be used with i18n <Trans> ', async () => {
    const title = 'injected title';
    const element = renderComponentAndReturnElement({
      children: title,
      href,
      isTransTest: true,
      external: true,
    });
    expect(element.textContent).toEqual(title);
    const hasIcon = element.innerHTML.includes('<svg');
    expect(hasIcon).toBeTruthy();
  });
});
