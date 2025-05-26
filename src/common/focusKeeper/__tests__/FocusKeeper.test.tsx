import React from 'react';
import { render } from '@testing-library/react';

import FocusKeeper from '../FocusKeeper';

// Note about tests:
// @testing-library fireEvent("keyPress",tab) does not simulate tab correctly
// @testing-library/user-event provides an alternative: userEvent.tab(),
// but it does not simulate focus redirect correctly. FocusKeeper's focus is not redirected to target
// That's why ended up just using element.focus() for testing

describe('<focusTrapper /> ', () => {
  it('keeps focus inside', async () => {
    let focusEventsOnTarget = 0;
    const focusListener = (e: React.FocusEvent<HTMLInputElement>) => {
      const id = e.target.getAttribute('id');
      if (id === 'target') {
        focusEventsOnTarget = focusEventsOnTarget + 1;
      }
    };
    const result = render(
      <div>
        <FocusKeeper targetId={'target'} className='focus-keeper'>
          <input type='text' id='target' onFocus={focusListener} />
          <input type='text' id='second' />
        </FocusKeeper>
      </div>,
    );
    // FocusKeeper has two elements that trap focus and redirect focus to target element.
    // one trapper before and one after the content to trap
    const getTrapperElement = (pos: 'before' | 'after') => {
      const focusKeeperSelector = 'div.focus-keeper';
      const trapperSelector = pos === 'before' ? '> div:first-child' : '> div:last-child';
      return result.container.querySelector(`${focusKeeperSelector} ${trapperSelector}`) as HTMLElement;
    };
    const focusTrapperBeforeContent = getTrapperElement('before');
    const focusTrapperAfterContent = getTrapperElement('after');
    focusTrapperBeforeContent.focus();
    expect(focusEventsOnTarget).toEqual(1);
    // move focus outside of FocusKeeper
    result.container.focus();
    expect(focusEventsOnTarget).toEqual(1);
    focusTrapperAfterContent.focus();
    expect(focusEventsOnTarget).toEqual(2);
  });
});
