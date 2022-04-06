import React, { Fragment, ReactElement } from 'react';

import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function AccessibilityStatementEn(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Accessibility Statement</FocusableH1>
      <p>
        This accessibility statement applies to the website Helsinki Profile of
        the City of Helsinki. The site address is https://profiili.hel.fi.
      </p>

      <h2> The objective of the city</h2>
      <p>
        As regards the accessibility of digital services, Helsinki aims to reach
        at least Level AA or above as set forth in the WCAG guidelines in so far
        as is reasonably practical.
      </p>

      <h2>Compliance status</h2>
      <p>This website fulfils the critical legal accessibility requirements.</p>

      <h2>Preparation of this accessibility statement</h2>
      <p>This statement was prepared on 5 April 2022.</p>

      <h3>Assessment of accessibility</h3>
      <p>
        The working instruction and procedures of the City of Helsinki were
        followed when evaluating the accessibility of the site, with the aim of
        ensuring that websites are accessible in all stages of the work process.
      </p>
      <p>
        Accessibility was evaluated by means of an audit by a third-party expert
        as well as self-evaluation.
      </p>
      <p>
        Accessibility was evaluated using a programmatic accessibility auditing
        tool as well as by manually reviewing the site and content. The
        programmatic assessment was carried out by using an automatic
        accessibility testing tool and a browser extension provided by
        Siteimprove.
      </p>
      <p>The third party expert audit was carried out by Siteimprove.</p>

      <h3>Updating the accessibility statement</h3>
      <p>
        When website technology or content changes, its accessibility must be
        ensured through constant monitoring and periodic checks. This statement
        will be updated in conjunction with website changes and accessibility
        evaluations.
      </p>

      <h2>Feedback and contact information</h2>
      <p>
        City Executive Office
        <br />
        Helsinki
      </p>

      <h3>Reporting non-accessible content</h3>
      <p>
        If a user feels that accessibility requirements have not been met, they
        can report the issue by e-mail to{' '}
        <a href="mailto:helsinki.palaute@hel.fi">helsinki.palaute@hel.fi</a> or
        through the feedback form at{' '}
        <Link href="https://www.hel.fi/feedback" external openInNewTab>
          www.hel.fi/feedback
        </Link>
      </p>

      <h3>Requesting information in an accessible format</h3>
      <p>
        If a user feels that content on a website is not available in an
        accessible format, they can request for this information by e-mail at
        <a href="mailto:helsinki.palaute@hel.fi">helsinki.palaute@hel.fi</a> or
        through the{' '}
        <Link href="https://www.hel.fi/feedback" external openInNewTab>
          feedback form
        </Link>
        . The aim is to reply to the enquiry within a reasonable time frame.
      </p>

      <h2>Legal protection of accessibility, Enforcement procedure</h2>
      <p>
        If a user feels that their report or enquiry has not received a response
        or that the response is unsatisfactory, they can report the issue to the
        Regional State Administrative Agency of Southern Finland. The website of
        the Regional State Administrative Agency of Southern Finland explains in
        detail how the matter will be processed.
      </p>
      <p>
        <strong>
          Regional State Administrative Agency of Southern Finland
        </strong>
        <br />
        <br />
        Accessibility monitoring unit
        <br />
        <Link
          href="https://www.saavutettavuusvaatimukset.fi"
          external
          openInNewTab
        >
          www.saavutettavuusvaatimukset.fi
        </Link>{' '}
        (in Finnish)
        <br />
        <a href="mailto:saavutettavuus@avi.fi">saavutettavuus@avi.fi</a>
        <br />
        Telephone exchange: <a href="tel:+358 295 016 000">+358 295 016 000</a>
        <br />
        Open: Mon-Fri at 8:00-16:15
      </p>

      <h2>The City of Helsinki and accessibility</h2>
      <p>
        The objective of the city of Helsinki is to be an accessible city to
        all. Helsinki aims to ensure that all residents are able to move about
        and act as effortlessly as possible and that all content and services
        are accessible to all.
      </p>
      <p>
        The city promotes accessibility of digital services by streamlining
        publishing work and organising accessibility-related training for its
        staff.
      </p>
      <p>
        The accessibility level of websites is monitored constantly during their
        maintenance. Immediate action will be taken if deficiencies are found.
        The aim is to carry out the necessary amendments as quickly as possible.
      </p>

      <h3>The disabled and users of assistive technologies</h3>
      <p>
        The city provides counselling and support for the disabled and users of
        assistive technologies. Support is available on guidance sites announced
        on the city’s website and through telephone counselling.
      </p>

      <h2>Approval of the accessibility statement</h2>
      <p>This statement was approved on 5 April 2022 by</p>
      <p>
        City Executive Office
        <br />
        Helsinki
      </p>
    </Fragment>
  );
}

export default AccessibilityStatementEn;
