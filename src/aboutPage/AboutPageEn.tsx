import React, { Fragment, ReactElement } from 'react';

import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function AboutPageEn(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>About Helsinki profile</FocusableH1>
      <p>
        The Helsinki profile is a user ID and storage service for personal and
        contact information. It brings together the customer&apos;s personal
        data and contacts with different city services in one place.
      </p>
      <p>
        You may use the Helsinki profile and its authentication to various digital applications
      </p>
      <ul>
        <li>strongly via suomi.fi authentication</li>
        <li>lightly by using the Helsinki ID email address and password combination.</li>
      </ul>
      <p>
        The use of the Helsinki profile and the data stored in it is mainly
        based on the customer&apos;s consent for light authentication and on a
        legal basis for strong authentication.{' '}
      </p>
      <p>
        The Helsinki profile supports Single Sign-On (SSO). This means that a
        customer who is already logged in to one service can switch to another
        without having to log in again, and the same contact details will be
        available to both services. The digital service using the Helsinki
        profile determines the level of authentication required from the
        customer: light or strong.
      </p>
      <h2>Strong identification</h2>
      <p>
        If the use of the service requires official personal data, the customer
        is offered strong authentication to the profile via Suomi.fi&apos;s
        central authentication service so that official personal data can be
        transmitted to the service.
      </p>
      <p>
        As official personal data, the Helsinki profile stores the basic
        information about the customer obtained through Suomi.fi from the
        Population Information System, which includes
      </p>
      <ul>
        <li>Official first name and surname</li>
        <li>Personal identity number</li>
        <li>Home address</li>
        <li>Municipality of the residence</li>
      </ul>
      <p>
        The official information is also displayed in the Helsinki profile for
        users who are strongly identified. The customer can change their data
        using the official process for changing personal data in the Population
        Information System. This is not possible in the Helsinki profile.
      </p>
      <p>
        Official personal data is updated from the Finnish Population
        Information System to your Helsinki profile each time you log in with
        suomi.fi.
      </p>
      <p>
        You give your consent for the various digital services to use the
        information contained in your profile. These applications may request
        it, for example, as a basis for providing services or products.
      </p>
      <p>
        There must always be a legal basis for the use of strong authentication,
        i.e. it cannot be required in all cases when using the service. However,
        light authentication can be offered as a voluntary form of
        authentication.
      </p>
      <h2>Light identification</h2>
      <p>
        In the case of authentication, light means that no personal information
        has been formally verified. Light Authenticate means that a user&apos;s
        profile contains a verified email address and password.
      </p>
      <p>
        This authentication method can be used when no formal personal
        information is required. For example, contact details are provided by
        the user rather than retrieved from official systems. The information
        can be edited by the customer in their Helsinki profile. This
        information is always available, even without strong authentication.
      </p>
      <p>Light data (mandatory data are marked with *) includes</p>
      <ul>
        <li>Name provided by the customer *.</li>
        <li>E-mail address *.</li>
        <li>Phone number and</li>
        <li>Address</li>
      </ul>
      <p>The email address is verified with a confirmation message.</p>
      <p>
        The user will always be asked for consent to use their Helsinki profile
        data when joining a new service. These consents are displayed in the
        &quot;Your Services&quot; section of the Helsinki profile interface.
        Consent can be withdrawn at any time.
      </p>
      <p>
        Users can edit the personal information they provide in their profile.
        They can also manage the use of their own data between different
        services. Users can download their data from different services as well
        as delete their data from one or all services. By deleting their entire profile,
        users will also delete all of their data from all of the services.
        Deleting data from individual services can be done in the profile’s settings.
      </p>
      <h2>Data Protection</h2>
      <p>
        The data is stored in the Helsinki profile database, from where it is
        transferred to various services based on the customer&apos;s consent. In
        the Helsinki profile, admin users can view and edit the data provided by
        the user. There are between 3 and 7 such users.
      </p>
      <p>
        In addition, members of the development team can access the database to
        develop the Helsinki profile and to troubleshoot problems.
      </p>
      <p>All activities are logged.</p>
      <p>
        Personal data, including personal identification number, may be
        transferred from the API of the Helsinki profile to other services if
        this information is needed by the service in question. This is done with
        the user&apos;s consent and the processing of this data is described in
        the privacy policy and terms of use of the service concerned.
      </p>
      <p>
        The Helsinki profile service is hosted on the City of Helsinki&apos;s
        Azure cloud, with servers located in Ireland. They are not mirrored to
        other Azure locations. Backups are stored in Azure in the same region as
        the servers themselves. No personal data is processed outside Helsinki.
      </p>
      <p>
        All personal data processed in the City&apos;s cloud service is
        protected by appropriate security keys (Microsoft EU Data Boundary). The
        data is kept for ten years after the event, in accordance with the
        retention period for municipal records.
      </p>
      <p>
        The processing of data in the Helsinki profile is described in{' '}
        <Link
          // eslint-disable-next-line max-len
          href="https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Keha/Sahkoisten%20asiointipalveluiden%20rekisteri.pdf"
          external
          openInNewTab
        >
          the Helsinki City e-services privacy policy
        </Link>{' '}
      </p>
      <p>
        Read more{' '}
        <Link
          // eslint-disable-next-line max-len
          href="https://www.hel.fi/en/decision-making/information-on-helsinki/data-protection-and-information-management/data-protection/rights-of-data-subjects-and-exercising-these-rights"
          external
          openInNewTab
        >
          about your rights under the EU General Data Protection Regulation in
          the City of Helsinki&apos;s online services.
        </Link>
      </p>
      <p>
        The service also uses the City&apos;s Matomo visitor tracking solution,
        the information collected by which is described in the Cookies section.
      </p>
      <h2>About cookies</h2>
      <p>
        Cookies are files stored by the browser on the users&apos; device.
        Cookies are used to enable features that make the service easier to use
        and to collect information about users in order to improve the service.
        Cookies allow us to provide you with a more user-friendly and functional
        website that better meets your needs.
      </p>
      <p>
        In terms of user data collection, cookies contain anonymous unique
        identifiers that allow us to collect information about users who visit
        our website, such as information about their browsers and devices. Site
        administrators do not have access to users&apos; unique identifiers.
        Cookies provide us with information about which browsers are used on our
        sites and which pages are most frequently viewed.
      </p>
      <p>
        This website also contains content provided by external online service
        providers. External online service providers may install their own
        cookies on browsers.
      </p>
      <p>
        The user can control the use of cookies by setting a cookie opt-out.
      </p>
      <p>
        The information collected by the Matomo solution for the purposes of
        visitor statistics is anonymous and cannot be linked to any individual
        person. This information includes
      </p>
      <ul>
        <li>IP address</li>
        <li>Geographical location on a city level</li>
        <li>Device model and operating system</li>
        <li>Browser used</li>
        <li>The time</li>
        <li>Entry and exit pages</li>
        <li>Pages visited and site activity</li>
      </ul>
    </Fragment>
  );
}

export default AboutPageEn;
