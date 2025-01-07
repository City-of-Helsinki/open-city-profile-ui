import React, { Fragment, ReactElement } from 'react';

import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function AccessibilityStatementEn(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Accessibility statement for Helsinki profile</FocusableH1>
      <p>
        This accessibility statement applies to the Helsinki profile webservice
        (https://profiili.hel.fi) run by the City of Helsinki. This statement
        explains the webservice’s accessibility and how to submit
        accessibility-related feedback.
      </p>
      <h2>How accessible is this webservice?</h2>
      <p>
        Finland’s Act on the Provision of Digital Services states that public
        websites must be accessible. In other words, everyone should have an
        equal opportunity to use websites.
      </p>
      <p>
        This webservice is fully compliant with all of the statutorily mandated
        accessibility requirements (WCAG criteria 2.1, A and AA standards).
      </p>
      <h3>Accessibility assessment</h3>
      <p>
        The accessibility assessment follows the City of Helsinki’s operational
        guidelines and methods that aim to secure the service’s accessibility
        throughout every work stage.
      </p>
      <p>
        The accessibility of the webservice has been assessed by both a
        self-assessment and a third-party expert audit. The assessment included
        programmatic accessibility testing and a manual examination of the
        webservice and its content.
      </p>
      <p>
        The shortcomings identified in the accessibility audit have been
        corrected by 21.05.2024.
      </p>
      <p>The external expert audit was carried out by Unicus Oy.</p>
      <h2>Did you notice shortcomings in accessibility?</h2>
      <p>
        We aim to continuously improve the accessibility of our webservice. If
        you encounter non-compliant content on the webservice that is not
        described on this page, please report it to us.{' '}
        <Link href="https://palautteet.hel.fi/en/" external openInNewTab>
          Send your feedback by filling out the City of Helsinki’s feedback
          form.
        </Link>
      </p>
      <h2>Accessibility monitoring</h2>
      <p>
        The Regional State Administrative Agency for Southern Finland enforces
        compliance with accessibility requirements. If you are dissatisfied with
        the reply you received from us about a detected accessibility
        shortcoming or you did not receive a reply within 14 days, you may
        submit a complaint or request for information to the Regional State
        Administrative Agency for Southern Finland. The website of the Regional
        State Administrative Agency of Southern Finland has information on
        submitting a complaint and how complaints are processed.
      </p>
      <p>
        Finnish Transport and Communication Agency Traficom <br />
        Digital Accessibility Supervision Unit <br />
        E-mail:{' '}
        <a href="mailto:saavutettavuus@traficom.fi">
          saavutettavuus@traficom.fi
        </a>
        <br />
        Telephone switchboard:{' '}
        <a href="tel:+358 295 345 000">+358 295 345 000</a> <br />
        <Link href="https://www.webaccessibility.fi" external openInNewTab>
          www.webaccessibility.fi
        </Link>
        <br />
      </p>

      <h2>Accessibility statement information</h2>
      <p>This website was published on 30.11.2022.</p>
      <p>This accessibility statement was prepared on 20.03.2024.</p>
      <p>This accessibility statement was last reviewed on 01.01.2025.</p>
      <p>
        <Link
          href="https://www.finlex.fi/fi/laki/alkup/2019/20190306"
          external
          openInNewTab
        >
          Act on the Provision of Digital Services (306/2019)
        </Link>
      </p>
    </Fragment>
  );
}

export default AccessibilityStatementEn;
