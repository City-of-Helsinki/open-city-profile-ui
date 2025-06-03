/* eslint-disable max-len */
import React, { Fragment, ReactElement } from 'react';
import { IconDownload, Link } from 'hds-react';

import styles from './UserGuide.module.css';
import UserGuideAccordion from './UserGuideAccordion';
import UserGuideImage from './UserGuideImage';
import TableOfContents from '../profile/components/tableOfContents/TableOfContents';
import image001 from './assets/01-sisaankirjautuminen-en.png';
import image003 from './assets/03-vahvan-valinta-en.png';
import image004 from './assets/04-vahvat-tiedot-en.png';
import image005 from './assets/05-10-sahkopostiosoite-en.png';
import image006 from './assets/06-11-sahkopostin-vahvistuskoodi-en.png';
import image007 from './assets/07-12-sahkopostin-vahvistus-en.png';
import image008 from './assets/08-profiilin-luominen-en.png';
import image009 from './assets/09-helsinki-tunnus-luonti-en.png';
import image010 from './assets/13-helsinki-tunnus-teko-en.png';
import image011 from './assets/14-salasanan-unohdus-en.png';
import image012 from './assets/15-sahkoposti-salasanalle-en.png';
import image013 from './assets/16-salasanan-vaihtopyynto-en.png';
import image014 from './assets/17-salasanan-vaihtoviesti-en.png';
import image015 from './assets/18-uusi-salasana-en.png';
import image016 from './assets/19-yhteensopimaton-kirjautuminen-en.png';
import image017 from './assets/20-kirjautumislogout-en.png';
import image018 from './assets/21-omat-tiedot-en.png';
import image019 from './assets/22-omat-nimitiedot-en.png';
import image023 from './assets/23-omat-yhteystiedot-en.png';
import image024 from './assets/24-olemassa-olevan-profiilin-kirjautuminen-en.png';
import image025 from './assets/25-kayttamasi-palvelut-en.png';
import image026 from './assets/26-tietojen-lataus-en.png';
import image027 from './assets/27-tietojen-poisto-palvelusta-en.png';
import image028 from './assets/28-tietojen-poisto-palvelusta-pop-up-en.png';
import image029 from './assets/29-tietojen-poisto-en.png';
import image030 from './assets/30-tietojen-poisto-popup-en.png';
import image031 from './assets/01-salasana-vaihto-en.png';
import image032 from './assets/02-salasana-vaihto-keycloak-en.png';
import image2fa01 from './assets/01-2fa-kayttoonnotto-en.jpg';
import image2fa02 from './assets/02-2fa-kayttoonotto-keycloak-en.jpg';
import image2fa03 from './assets/03-2fa-kirjautuminen-en.jpg';
import image2fa04 from './assets/04-2fa-kaytostapoisto-en.jpg';
import image2fa05 from './assets/05-2fa-kaytostapoisto-varmistus-en.jpg';
import FocusableH1 from '../common/focusableH1/FocusableH1';

const tableOfContents = [
  { title: 'Create a Helsinki profile', href: '#_Create_a_Helsinki_profile' },
  { title: 'Login', href: '#_Login' },
  {
    title: 'Viewing and editing your own data',
    href: '#_viewing_and_editing',
  },
  { title: 'Deleting your information', href: '#_Deleting_your_information' },
];

const lang = 'en';

function UserGuideEn(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Helsinki profile guide</FocusableH1>
      <p className={styles['summary']}>
        The Helsinki profile is the customer profile of a citizen using the
        city&apos;s digital services. It is the primary means of identification
        for the City&apos;s digital services. The Helsinki profile brings
        together the customer&apos;s personal information and contact
        information, as well as links to different city services, in one place.
        The profile allows users to manage their own data and its visibility
        across different services.
      </p>
      <Link
        href="/Helsinki-profile-userguide.pdf"
        download="Helsinki-profile-userguide.pdf"
        className={styles['download-link']}
        useButtonStyles
        iconStart={<IconDownload />}
      >
        Helsinki profile guide (.pdf)
      </Link>

      <TableOfContents items={tableOfContents} heading="On this site" />

      <h2 id="_Create_a_Helsinki_profile">Create a Helsinki profile</h2>
      <p>
        The Helsinki profile is used by logging in to the City of
        Helsinki&apos;s customer services. The first time you log in, you will
        be asked to create a Helsinki profile and give your consent to the use
        of the data required by the service.
      </p>
      <p>
        You can also create a Helsinki profile at{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>
      </p>
      <p>
        You can create a Helsinki profile using your Suomi.fi e-Identification
        or your email and password. You can also log in to the City of
        Helsinki&apos;s digital services using Google or Yle IDs, which will be
        phased out in 2024.
      </p>

      <UserGuideAccordion
        id="_Suomi.fi_identification"
        heading="Suomi.fi identification"
        language={lang}
      >
        <h4>Choice of authentication</h4>

        <p>
          After pressing the Login link in the service, the user is presented
          with a screen offering various login options, where the Suomi.fi login
          is selected. The view of the login options varies from one service to
          another.
        </p>

        <UserGuideImage
          src={image001}
          alt="In the authentication window, select Suomi.fi identification."
        />

        <h4>Identification in the Suomi.fi service</h4>

        <p>
          After selecting the Suomi.fi login, the user will be presented with
          different login options. The options are the same as for other
          government services offering strong authentication.
        </p>

        <p>
          After authentication, check that the information you are using is
          correct. If you find any errors in the data, they must be corrected in
          the Population Register Centre&apos;s service.
        </p>

        <UserGuideImage
          src={image003}
          alt="Choose your bank or mobile account as your Suomi.fi authentication option."
        />

        <UserGuideImage
          src={image004}
          alt="Check that your details are correct when you switch back to the City of Helsinki service."
        />

        <h4>Email address verification</h4>

        <p>
          After authentication, you will be asked for your email address. A
          confirmation message will be sent to the email address to verify the
          authenticity of the address.
        </p>

        <p>
          If you have already created Helsinki profile with an email address and
          password, you can use the same email address. In this case, the
          different authentication methods will be combined, and you will be
          able to see all the services you use at once.{' '}
          <b>
            Please note, however, that you will not be able to unlink them
            later.
          </b>
        </p>

        <p>
          To confirm your email, you will receive a 6-digit code to the email
          address you provided. If the message does not arrive in your inbox
          almost immediately, check your spam folder.
        </p>

        <p>
          <b>
            Do not close the browser window of your Helsinki profile when you
            retrieve the confirmation message from your email. Otherwise, the
            system will assume that you have interrupted the authentication
            process.
          </b>
        </p>

        <UserGuideImage
          src={image005}
          alt={`Your email address will serve as your login to City of Helsinki services.
            By using the same email address for both the Suomi.fi login and the Helsinki ID,
            you will have one Helsinki profile. The merge cannot be unmerged later.`}
        />

        <UserGuideImage
          src={image006}
          alt="The email contains a 6-digit verification code to confirm that the email address is genuine."
        />

        <UserGuideImage
          src={image007}
          alt="The 6-digit number of the email must be entered in the verification code field in the browser window."
        />

        <h4>Create a Helsinki profile</h4>
        <p>
          After confirming the email, you will still need to give your consent
          to the use of your data. Without your consent, a Helsinki profile
          cannot be created, and the services cannot use your data.
        </p>

        <p>
          You will then have a Helsinki profile, and your Suomi.fi login details
          will be saved in your profile. Different services use your data in
          different ways, but they will always tell you how they use it when you
          first log in. The information is also always available in your
          Helsinki profile.
        </p>

        <p>
          After creating your Helsinki profile, you will be logged in to the
          service where you started the sign-up process. You can access your
          Helsinki profile at{' '}
          <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>.
        </p>

        <p>
          The next time you log in to the same service, you simply select
          Suomi.fi, the authentication option of your choice, and you are inside
          the service.
        </p>

        <UserGuideImage
          src={image008}
          alt={`Before you can use the service you want or before you can create your Helsinki profile, you must give your consent to the use of your data. Without consent, your data cannot be used and therefore no profile can be created.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        id="_Email_identification"
        heading="Email identification"
        language={lang}
      >
        <h4>Choice of authentication</h4>
        <p>
          After pressing the log in link on the digital service site, you will
          see different login options, from which you can choose Create Helsinki
          profile. The view of the login options varies from one service to
          another.
        </p>

        <UserGuideImage
          src={image009}
          alt={`The Helsinki ID consists of an email and password combination, which will be created by clicking on the Create a new Helsinki profile button.`}
        />

        <h4>Email address verification</h4>
        <p>
          When you create your profile, you will be asked for your email
          address, which will also serve as your username. A confirmation
          message will be sent to the email address to verify the authenticity
          of the address.
        </p>

        <p>
          If you have already created Helsinki profile using Suomi.fi
          authentication, you can create a password for your profile by clicking
          on the <i>I have forgotten my password</i> link. For more information
          on creating a password, see{' '}
          <a href="#_Forgotten_password">Forgotten password</a>. In this case,
          both the services requiring Suomi.fi authentication and email password
          authentication can be found in the same Helsinki profile, and you can
          manage all your information in one view.{' '}
          <b>
            Please note, however, that you will not be able to cancel the merge
            later.
          </b>
        </p>

        <p>
          To confirm your email, you will receive a 6-digit code to the email
          address you provided. If the message does not arrive in your inbox
          almost immediately, check your spam folder.
        </p>

        <p>
          <b>
            Do not close the browser window of your Helsinki profile when you
            retrieve the confirmation message from your email. Otherwise, the
            system will assume that you have interrupted the authentication
            process.
          </b>
        </p>

        <UserGuideImage
          src={image005}
          alt={`Your email address will serve as your login to City of Helsinki services.
            By using the same email address for both the Suomi.fi login and the Helsinki ID,
            you will have one Helsinki profile. The merge cannot be unmerged later.`}
        />

        <UserGuideImage
          src={image006}
          alt="The email contains a 6-digit verification code to confirm that the email address is genuine."
        />

        <UserGuideImage
          src={image007}
          alt="The 6-digit number of the email must be entered in the verification code field in the browser window."
        />

        <h4>Create a Helsinki profile</h4>
        <p>
          After confirming the email, please fill in your name and password.
          Your password must be at least 12 characters long, and include upper
          and lowercase letters, numbers and special characters.
        </p>
        <p>
          Confirm that you agree to the use of your data. Without your consent,
          your Helsinki profile cannot be created, and your data cannot be used
          by the services.
        </p>
        <p>
          A Helsinki profile has now been created for you. The Helsinki profile
          you need to authenticate with the services is this email address and
          password combination.
        </p>

        <UserGuideImage
          src={image010}
          alt={`When you create a Helsinki profile, you still have to fill in
            your name and password. You will also need to give your consent
            for your data to be used in order to create Helsinki profile.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        id="_Combining_identification_methods"
        heading="Combining identification methods"
        language={lang}
      >
        <p>
          If you wish, you can combine different authentication methods into a
          single Helsinki profile, allowing you to view and manage all your data
          and services at once. This can be done by first creating a Helsinki ID
          with an email address/password combination and then using the same
          email address for the first Suomi.fi authentication.
        </p>

        <p>
          <b>
            Please note, however, that you will not be able to unlink them
            later.
          </b>
        </p>

        <p>
          If your Helsinki profile was created with Suomi.fi authentication, you
          can click on the <i>I forgot my password</i> link in the login screen.
          See the <a href="#_Forgotten_password">Forgotten password</a> section
          below for instructions on how to do this.
        </p>
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Kaksivaiheinen_tunnistautuminen"
        heading="Two-factor authentication"
      >
        <p>
          Two-factor authentication increases the security of your account. When
          you enable it, in addition to a password, a separate one-time code is
          required to log in to your Helsinki profile, which you retrieve from
          the authentication app.
        </p>

        <h4>How to enable two-factor authentication</h4>

        <p>
          You can activate two-factor authentication on Helsinki profile on the{' '}
          <i>My information</i>-page in the Login and authentication section.
        </p>

        <UserGuideImage
          src={image2fa01}
          alt="Two-factor authentication on the My information- page."
        />

        <UserGuideImage
          src={image2fa02}
          alt="Two-factor authentication enabling view. Follow the numbered instructions."
        />
        <p>
          Follow the setup instructions and download an authentication app of
          your choice such as Google Authenticator, Microsoft Authenticator or
          FreeOTP to your mobile device.
        </p>
        <p>
          Open the authentication app and scan the QR code on the screen. If you
          cannot scan the code, you can enter it manually by selecting the{' '}
          <i>&quot;Can&apos;t read the code?&quot;</i> link.
        </p>
        <p>
          <b>
            Save the code that pops up from the link so that you can still
            access your account in case of problems such as your phone breaking
            down.
          </b>
        </p>
        <p>
          The authentication app will generate a one-time code that you enter in
          the Helsinki profile view in step 3.
        </p>
        <p>
          <b>
            Do not close the browser window of your Helsinki profile when
            retrieving the one-time code from your authentication application.
            Otherwise, the system will assume that you have aborted the
            activation process.
          </b>
        </p>
        <p>
          Once verification is successful, two-step authentication is enabled
          and you will see it activated on the My information-page.
        </p>

        <h4>Logging in with two-factor authentication</h4>

        <p>
          If your account has two-factor authentication enabled when you sign in
          by email, you will be prompted by the system for a one-time code
          generated by your previously defined authentication application.
        </p>

        <UserGuideImage
          src={image2fa03}
          alt="Retrieve and paste the one-time code from your authentication application into this view."
        />

        <p>
          Go to your authentication application, copy the code and paste it into
          the Profile login view. The code is usually valid for one minute.
        </p>

        <p>
          <b>
            Do not close the browser window of your Helsinki profile when you
            retrieve the one-time code from your authentication app. Otherwise,
            the system will assume that you have aborted the login process.
          </b>
        </p>
        <p>
          If you do not have access to your authentication app, sign in to your
          profile with suomi.fi and follow the instructions in the{' '}
          <a href="#_Todennus_sovellus_ei">
            Authentication application not available or code not working
          </a>{' '}
          section.
        </p>

        <h4>Disabling two-factor authentication</h4>

        <p>
          You can disable two-factor authentication on the <i>My information</i>
          -page.
        </p>

        <UserGuideImage
          src={image2fa04}
          alt="Disable two-factor authentication by clicking the “Disable“ button."
        />

        <p>
          The system will ask you to confirm the deactivation with your login
          details and a one-time code from the authentication application.
        </p>

        <UserGuideImage
          src={image2fa05}
          alt="Confirmation of disabling two-factor authentication."
        />

        <p>
          After deletion, be sure to also delete the link/account associated
          with your Helsinki profile from your authentication application.
        </p>

        <p>
          You can re-enable two-factor authentication at any time from the
          profile details.
        </p>
        <p>
          If you have a so-called hybrid account with both light authentication
          and strong suomi.fi-authentication, you can also disable two-factor
          authentication with suomi.fi-authentication.
        </p>

        <h4 id="_Todennus_sovellus_ei">
          Authentication application not available or code not working
        </h4>
        <p>
          If you do not have access to your authentication app, for example
          because you have changed your phone, you can authenticate to your
          Helsinki profile with a strong suomi.fi-authentication, which will
          allow you to disable two-factor authentication from the{' '}
          <i>My information</i>-page.
        </p>
        <p>
          If you do not yet have suomi.fi-authentication in your Helsinki
          profile, you can enable it by authenticating with suomi.fi and
          creating a strong authentication account via email.{' '}
          <b>Use the same email address</b>, so that light and strong
          authentication are combined. Then you can turn off two-step
          authentication from your account information.
        </p>
        <p>
          If you already have a strong account with <i>suomi.fi</i>
          -authentication with a different email address, you will unfortunately
          no longer be able to deactivate two-factor authentication.{' '}
          <b>
            Therefore, it is very important to save the initial authentication
            code.
          </b>
        </p>
      </UserGuideAccordion>

      <h2 id="_Login">Login</h2>
      <p>
        With your Helsinki profile, you can log in to the digital services of
        the City of Helsinki. You can log in using the Suomi.fi e-Identification
        or the email address and password you provided when creating your
        profile.
      </p>

      <UserGuideAccordion
        language={lang}
        id="_Forgotten_password"
        heading="Forgotten password"
      >
        <p>
          If you can&apos;t remember your password, you can create a new one in
          the login window using the <i>I forgot my password </i>
          link. You may also have &quot;forgotten&quot; your password because
          you have previously logged in to the service using Suomi.fi, in which
          case you didn&apos;t have to create a password.
        </p>

        <p>
          Once you have entered your email, you will receive a link to enter a
          new password in your email. The link will be valid for 30 minutes.
        </p>

        <p>
          The password must be at least 12 characters long. It must use both
          upper and lower case letters, numbers and special characters.
        </p>

        <UserGuideImage
          src={image011}
          alt="In the login window, click on the I forgot my password link."
        />

        <UserGuideImage
          src={image012}
          alt="Enter your email address in the box that appears to receive a password renewal link in your email."
        />

        <UserGuideImage
          src={image013}
          alt="You will be informed that an email will be sent to you to renew your password."
        />

        <UserGuideImage
          src={image014}
          alt={`In the email you receive, there will be a link to enter a new password.
            The link will be valid for 30 minutes.`}
        />

        <UserGuideImage
          src={image015}
          alt={`In the update password window, you must enter the same password twice.
            The password must be at least 12 characters long. The password must contain
            both upper and lower case letters, numbers and special characters.`}
        />
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Changing_password"
        heading="Changing password"
      >
        <p>
          You can change your password to a new one at any time from the Login
          and authentication section of the <i>My information</i>-page.
        </p>

        <UserGuideImage
          src={image031}
          alt="Changing password on the My information-page."
        />

        <p>
          If your account has two-factor authentication, you will need a
          one-time code from your authentication application to change your
          password. For help with two-factor authentication issues, see the
          section of this guide called <i>“Two-factor authentication.”</i>
        </p>

        <UserGuideImage
          src={image032}
          alt="Press the eye icon to show or hide the password in the view."
        />

        <p>
          Enter the new password of your choice in the field. The password must
          be at least 12 characters long. The password must contain both upper
          and lower case letters, numbers and special characters. Press the eye
          icon to show or hide the password.
        </p>
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Problem_with_identification"
        heading="Problem with identification"
      >
        <p>
          When you move from one service to another, the way you authenticate
          may be different for each service. For example, you were logged in to
          the first service with your Helsinki ID, i.e. a combination of email
          and password, but the second service requires you to authenticate with
          Suomi.fi. In this case, you will receive a message saying that the
          authentication method is not compatible. You will need to log out from
          the previous service in order to log in to the new service. Two
          different authentication methods cannot be open at the same time.
        </p>

        <UserGuideImage
          src={image016}
          alt={`An incompatible login method means, for example, that you have logged
            in to one service with an email/password combination and you have moved on to
            the next service, which requires a Suomi.fi authentication. In this case,
            you need to log out of the first service in order to authenticate to the new service.`}
        />

        <UserGuideImage
          src={image017}
          alt="Confirm the logout from a previous service."
        />
      </UserGuideAccordion>

      <h2 id="_viewing_and_editing">Viewing and editing your own data</h2>
      <p>
        By logging in to your Helsinki profile at{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>, you can
        view and edit your data and how it is used by the services.
      </p>
      <UserGuideAccordion
        language={lang}
        id="_Editing_profile_information"
        heading="Editing profile information"
      >
        <p>
          The official information will be added to your profile and will only
          be visible when you authenticate with Suomi.fi. Updating this
          information is done in the Population Register Centre service.
        </p>
        <p>
          In the <i>My information</i> -section of your Helsinki profile, you
          can add a phone number, change your email address, and add address
          information. If you change your name information in your Helsinki
          profile, the next time you log in using Suomi.fi, your information
          will be updated according to the information available in the
          Population Register Centre.
        </p>
        <p>
          You can add or change the information you have entered yourself by
          clicking on the <i>Add</i> button, or the <i>Edit</i> button if the
          information already exists. Press the <i>Save</i> button to save the
          data in the database.
        </p>
        <p>
          In the Helsinki profile, the language of communication section
          determines the language in which, for example, emails from the service
          will be sent. You can also see how you are authenticated to your
          Helsinki profile.
        </p>

        <UserGuideImage
          src={image018}
          alt={`In the My Information section of the Helsinki profile, official information
            comes directly from the Population Register Centre and is updated there as well.`}
        />

        <UserGuideImage
          src={image019}
          alt="In the My information section of your Helsinki profile, you can update the basic data yourself."
        />

        <UserGuideImage
          src={image023}
          alt={`You can add and edit your other address details, your phone number and your email address. The
            language of communication determines the language in which you receive messages from the service.
            The authentication method tells you how you are logged in to the service, i.e. Suomi.fi authentication
            or an email/password combination, i.e. the Helsinki ID.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Processing_of_your"
        heading="Processing of your data by different services"
      >
        <p>
          The services will use the data managed by the Helsinki profile as
          indicated. The first time you authenticate to a service, you can see
          what information the service uses.
        </p>

        <p>
          In your Helsinki profile, you can check this information later and, if
          you wish, delete your data from the service. It is not possible to
          delete your data if your service process has not been completed. It is
          also advisable to{' '}
          <a href="#_Download_your_information">
            download your own information
          </a>{' '}
          before deleting it.
        </p>

        <UserGuideImage
          src={image024}
          alt={`When you authenticate to the new service, you will be asked to
            consent to the use of your data required by the service. You can return to this information later on the Your services section of your Helsinki profile.`}
        />

        <UserGuideImage
          src={image025}
          alt={`In the Your services used section of your Helsinki profile, you can
            see all the services you are authenticated to and what data they use.
            You can also delete your data from individual services.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Download_your_information"
        heading="Download your information"
      >
        <p>
          You can also download the data you have stored in different services
          as a single JSON file. For more information on{' '}
          <a href="https://fi.wikipedia.org/wiki/JSON">
            the{' '}
            <u>JSON file format, see Wikipedia (link opens in a new window)</u>
          </a>
          .
        </p>
        <p>
          If you have combined the Suomi.fi authentication and the email address
          / password login in the same Helsinki profile, the data download must
          be done with the Suomi.fi authentication.
        </p>

        <UserGuideImage
          src={image026}
          alt={`In the My information section of your Helsinki profile,
            you can download your data for all services as a JSON file.`}
        />
      </UserGuideAccordion>

      <h2 id="_Deleting_your_information">Deleting your information</h2>
      <p>
        You can delete your data either for individual services or for your
        entire profile. Upon deletion, all your data from the service will be
        deleted or anonymised if, for example, the service is required by law to
        retain it. However, you will not have access to the data after deletion
        nor will it be linked to you.
      </p>

      <UserGuideAccordion
        language={lang}
        id="_Deleting_your_information"
        heading="Deleting your information from a single service"
      >
        <p>
          If you have combined your Suomi.fi authentication and email address /
          password login in the same Helsinki profile, you must delete the
          service while authenticated with Suomi.fi.
        </p>

        <p>
          When you select the service, you want to delete on the Your services
          tab, you will receive a pop-up message confirming the deletion.
        </p>

        <UserGuideImage
          src={image027}
          alt={`You can delete your data in your Helsinki profile for an individual
            service in the Your services section.`}
        />

        <UserGuideImage
          src={image028}
          alt={`After clicking on the "Delete your data from this service" button, you will
            receive a pop-up confirmation message on the screen to prevent accidental deletion.`}
        />
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Deleting_your_Helsinki_profile"
        heading="Deleting your Helsinki profile"
      >
        <p>
          If you want to delete your entire Helsinki profile, you can do so by
          pressing the <i>Delete my information</i> button. You will then see a
          pop-up window where you will be asked to confirm that you want to
          delete your information. After confirming the request, all data will
          be deleted from the profile and from all services, if no service is
          pending.
        </p>
        <p>
          Some statutory services may require data to be retained for a limited
          or permanent period. Depending on the transaction and the service,
          data may be anonymized in some cases. If a statutory service is
          required to retain data, the profile or the data used by that service
          cannot be deleted.
        </p>
        <p>
          If you have combined the Suomi.fi authentication and the email address
          / password login in the same Helsinki profile, you must delete the
          profile while authenticated with Suomi.fi.
        </p>
        <p>
          After deleting your Helsinki profile, you can always create a new
          profile, if necessary, but all previous data will be lost.
        </p>
        <UserGuideImage
          src={image029}
          alt={`
            In the My information section of your Helsinki profile, there is a Delete my
            information button that allows you to delete your entire Helsinki profile
             and your information used in different services.`}
        />

        <UserGuideImage
          src={image030}
          alt={`A confirmation message is also displayed in a pop-up window
            to prevent accidental deletion of the data.`}
        />
      </UserGuideAccordion>
    </Fragment>
  );
}

export default UserGuideEn;
