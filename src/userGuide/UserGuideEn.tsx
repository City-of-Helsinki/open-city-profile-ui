import React, { Fragment, ReactElement } from 'react';

import image001 from './assets/01-sisaankirjautuminen-en.png';
import image002 from './assets/02-sisaankirjautuminen-tunnistamo-en.png';
import image003 from './assets/03-vahvan-valinta-en.png';
import image004 from './assets/04-vahvat-tiedot-en.png';
import image005 from './assets/05-10-sahkopostiosoite-en.png';
import image006 from './assets/06-11-sahkopostin-vahvistuskoodi.png';
import image007 from './assets/07-12-sahkopostin-vahvistus-en.png';
import image008 from './assets/08-profiilin-luominen-en.png';
import image009 from './assets/09-helsinki-tunnus-luonti-en.png';
import image010 from './assets/13-helsinki-tunnus-teko-en.png';
import image011 from './assets/14-salasanan-unohdus-en.png';
import image012 from './assets/15-sahkoposti-salasanalle-en.png';
import image013 from './assets/16-salasanan-vaihtopyynto.png';
import image014 from './assets/17-salasanan-vaihtoviesti-en.png';
import image015 from './assets/18-uusi-salasana-en.png';
import image016 from './assets/19-yhteensopimaton-kirjautuminen-en.png';
import image017 from './assets/20-kirjautumislogout.png';
import image018 from './assets/21-omat-tiedot-en.png';
import image019 from './assets/22-omat-nimitiedot-en.png';
import image020 from './assets/23-omat-yhteystiedot-en.png';
import image021 from './assets/24-asiointikieli-en.png';
import image022 from './assets/25-kirjautumistapa-en.png';
import image023 from './assets/26-olemassa-olevan-profiilin-kirjautuminen-en.png';
import image024 from './assets/27-kayttamasi-palvelut-en.png';
import image025 from './assets/28-tietojen-lataus-en.png';
import image026 from './assets/29-tietojen-poisto-palvelusta-en.png';
import image027 from './assets/30-tietojen-poisto-palvelusta-pop-up-en.png';
import image028 from './assets/31-tietojen-poisto-palvelusta-pop-up-varmistusviesti-en.png';
import image029 from './assets/32-tietojen-poisto-en.png';
import image030 from './assets/33-tietojen-poisto-popup-en.png';
import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function UserGuideEn(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Helsinki profile user guide</FocusableH1>

      <p>Helsinki profile guide</p>

      <p>
        The Helsinki profile is the customer profile of a citizen using the
        city&apos;s digital services. It is the primary means of identification
        for the City&apos;s digital services. The Helsinki Profile brings
        together in one place the customer&apos;s personal and contact
        information and links to different city services. The profile allows
        users to manage their own data and its visibility across different
        services. The Helsinki profile is used for identification and
        authentication to the different digital applications:
      </p>

      <p>using suomi.fi authentication, for example with your bank details</p>

      <p>
        using the email address + password combination of the Helsinki ID,
        Google or Yle IDs
      </p>

      <p>
        <a href="#_Identify_to_the">Identify to the service</a>
      </p>

      <p>
        <a href="#_Suomi.fi_identification">Suomi.fi identification</a>
      </p>

      <p>
        <a href="#_Email_and_password">Email and password identification</a>
      </p>

      <p>
        <a href="#_Combining_identification_methods">
          Combining identification methods
        </a>
      </p>

      <p>
        <Link href="#_Forgotten_password">Forgotten password</Link>
      </p>

      <p>
        <a href="#_Problem_with_identification">Problem with identification</a>
      </p>

      <p>
        <a href="#_Viewing_and_editing">Viewing and editing your own data</a>
      </p>

      <p>
        <a href="#_Processing_of_your">
          Processing of your data by different services
        </a>
      </p>

      <p>
        <a href="#_Download_your_information">Download your information</a>
      </p>

      <p>
        <a href="#_Deleting_your_information">
          Deleting your information from a single service or from your entire
          Helsinki profile
        </a>
      </p>

      <h2 id="_Identify_to_the">Identify to the service</h2>

      <p>
        The most common way to use a Helsinki profile is to log in to one of the
        City of Helsinki&rsquo;s services, where the Helsinki profile acts as a
        proxy for personal or contact information.
      </p>

      <p>
        The first time you log in, you will be asked to create a Helsinki
        profile. At the same time, you will be asked to give your consent to the
        use of the data required by that service.
      </p>

      <p>
        You can identify yourself to the service either by authenticating with
        suomi.fi, for example with your bank details, or by using an e-mail and
        a password.
      </p>

      <h3 id="_Suomi.fi_identification">Suomi.fi identification</h3>

      <p>
        After pressing the Login link in the Service, the user is presented with
        a screen offering various login options, where the suomi.fi login is
        selected. The view of the login options varies from one service to
        another.
      </p>

      <p>
        <img
          width={217}
          height={399}
          src={image001}
          alt="In the authentication window, select suomi.fi identification."
        />
      </p>

      <p>
        <img
          src={image002}
          width={405}
          height={250}
          alt="In the authentication window, select suomi.fi identification."
        />
      </p>

      <p>
        After selecting the Suomi.fi login, the user will be presented with
        different login options. The options are the same as for other
        government services offering strong authentication.
        <img
          src={image003}
          width={482}
          height={397}
          alt="Choose your bank or mobile account as your suomi.fi authentication option."
        />
        After authentication, check that the information you are using is
        correct. If you find any errors in the data, they must be corrected in
        the Population Register Centre&apos;s service.
      </p>

      <p>
        <img
          src={image004}
          width={425}
          height={325}
          alt="Check that your details are correct when you switch back to the City of Helsinki service."
        />
      </p>

      <p>
        After authentication, you will be asked for your email address, which
        you will need to confirm.
      </p>

      <p>
        If you have already created Helsinki profile with an email address and
        password, you can use the same email address. In this case, the
        different authentication methods will be combined, and you will be able
        to see all the services you use at once.{' '}
        <b>
          Please note, however, that you will not be able to unlink them later.
        </b>
      </p>

      <p>
        <img
          src={image005}
          width={389}
          height={481}
          alt={`Your email address will serve as your login to City of Helsinki services. 
            By using the same email address for both the suomi.fi login and the Helsinki ID, 
            you will have one Helsinki profile. The merge cannot be unmerged later.`}
        />
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

        <img
          src={image006}
          width={482}
          height={323}
          alt="The email contains a 6-digit verification code to confirm that the email address is genuine."
        />
      </p>

      <p>
        Enter the number in the box on the screen.
        <img
          src={image007}
          width={427}
          height={499}
          alt="The 6-digit number of the email must be entered in the verification code field in the browser window."
        />
      </p>

      <p>
        After confirming the email, you will still need to give your consent to
        the use of your data. Without consent, Helsinki profile cannot be
        created and the services cannot use your data.
        <img
          src={image008}
          width={216}
          height={508}
          alt={`Before you can use the service you want or before you can create 
            Helsinki profile, you must give your consent to the use of your data. 
            Without consent, your data cannot be used and therefore no profile can be created.`}
        />
      </p>

      <p>
        You will then have Helsinki profile, and your suomi.fi login details
        will be saved in your profile. Different services use your data in
        different ways, but they will always tell you how they use it when you
        first log in. The information is also always available in your Helsinki
        profile.
      </p>

      <p>
        After creating your Helsinki profile, you will be logged in to the
        service where you started the sign-up process. You can access your
        Helsinki profile at{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>.
      </p>

      <p>
        The next time you log in to the same service, you simply select
        suomi.fi, the authentication option of your choice and you are inside
        the service.
      </p>

      <h3 id="_Email_and_password">Email and password identification</h3>

      <p>The other authentication options for the Helsinki profile are</p>

      <p>Helsinki ID, i.e. a combination of email and password</p>

      <p>the Google or Yle ID will be phased out in 2024</p>

      <p>
        <img
          src={image009}
          width={325}
          height={493}
          alt={`The Helsinki ID consists of an email and password combination 
            by clicking on the Create a new Helsinki profile button.`}
        />
      </p>

      <p>
        You will be asked for your email address, to which a confirmation
        message will be sent to verify the authenticity of the address.
      </p>

      <p>
        If you have already created Helsinki profile using suomi.fi
        authentication, you can create a password for your profile by clicking
        on the I have forgotten my password link.
      </p>

      <p>
        For more information on creating a password, see
        <a href="#_Forgotten_password">Forgotten password</a>.
      </p>

      <p>
        In this case, both the services requiring suomi.fi authentication and
        email password authentication can be found in the same Helsinki profile
        and you can manage all your information in one view.{' '}
        <b>
          Please note, however, that you will not be able to cancel the merge
          later.
        </b>
      </p>

      <p>
        <img
          src={image005}
          width={389}
          height={481}
          alt={`Your email address will serve as your login to City of Helsinki services. 
            By using the same email address for both the suomi.fi login and the Helsinki ID, 
            you will have one Helsinki profile. The merge cannot be unmerged later.`}
        />
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

        <img
          src={image006}
          width={482}
          height={323}
          alt="The email contains a 6-digit verification code to confirm that the email address is genuine."
        />
      </p>

      <p>
        Enter the number in the box on the screen.
        <img
          src={image007}
          width={427}
          height={499}
          alt="The 6-digit number of the email must be entered in the verification code field in the browser window."
        />
      </p>

      <p>
        After confirming the email, you will still need to give your consent to
        the use of your data. Without consent, a Helsinki profile cannot be
        created and the services cannot use your data.
      </p>

      <p>
        After entering the 6-digit verification code, please fill in your name,
        enter your password and give your consent to the use of your data. The
        password must contain at least 12 characters, upper and lower case
        letters, numbers and special characters.{' '}
      </p>

      <p>
        <img
          src={image010}
          width={218}
          height={409}
          alt={`When you create Helsinki profile, you still have to fill in 
            your name and password. &#10;You will also need to give your consent 
            for your data to be used in order to create Helsinki profile.`}
        />
      </p>

      <p>
        Now you have Helsinki profile. The Helsinki ID you need to authenticate
        to the services is this email address/password combination.
      </p>

      <h2 id="_Combining_identification_methods">
        Combining identification methods
      </h2>

      <p>
        If you wish, you can combine different authentication methods into a
        single Helsinki profile, allowing you to view and manage all your data
        and services at once. This can be done by first creating a Helsinki ID
        with an email address/password combination and then using the same email
        address for the first suomi.fi authentication.
      </p>

      <p>
        If your Helsinki profile was created with a suomi.fi authentication, you
        can click on the <i>I forgot my password</i> link in the login screen.
        See the <a href="#_Forgotten_password">Forgotten password</a>
        section below for instructions on how to do this.
      </p>

      <h2 id="_Forgotten_password">Forgotten password</h2>

      <p>
        If you can&apos;t remember your password, you can create a new one in
        the login window using the <i>I forgot my password</i>
        link. You may also have &quot;forgotten&quot; your password because you
        have previously logged in to the service using suomi.fi, in which case
        you didn&apos;t have to create a password.
        <img
          src={image011}
          width={325}
          height={493}
          alt="In the login window, click on the I forgot my password link."
        />
      </p>

      <img
        src={image012}
        width={328}
        height={324}
        alt="Enter your email address in the box that appears to receive a password renewal link in your email."
      />
      <img
        src={image013}
        width={284}
        height={505}
        alt="You will be informed that an email will be sent to you to renew your password."
      />

      <p>
        Once you have entered your email, you will receive a link to enter a new
        password in your email. The link will be valid for 30 minutes.
      </p>

      <p>
        <img
          src={image014}
          width={482}
          height={308}
          alt={`In the email you receive, there will be a link to enter a new password. 
            The link will be valid for 30 minutes.`}
        />
      </p>

      <p>
        The password must be at least 12 characters long. It must use both upper
        and lower case letters, numbers and special characters.
      </p>

      <p>
        <img
          src={image015}
          width={325}
          height={337}
          alt={`In the password change window, you must enter the same password twice. 
            The password must be at least 12 characters long. The password must contain 
            both upper and lower case letters, numbers and special characters.`}
        />
      </p>

      <h2 id="_Problem_with_identification">Problem with identification</h2>

      <p>
        When you move from one service to another, the way you authenticate may
        be different for each service. For example, you were logged in to the
        first service with your Helsinki ID, i.e. a combination of email and
        password, but the second service requires you to authenticate with
        suomi.fi. In this case, you will receive a message saying that the
        authentication method is not compatible. You will need to log out from
        the previous service in order to log in to the new service. Two
        different authentication methods cannot be open at the same time.
      </p>

      <p>
        <img
          src={image016}
          width={388}
          height={333}
          alt={`An incompatible login method means for example that you have logged 
            in to one service with an email/password combination and you move on to 
            the next service, which requires a suomi.fi authentication. In this case, 
            you need to log out of the first service in order to authenticate to the new service.`}
        />
      </p>

      <p>
        <img
          src={image017}
          width={433}
          height={345}
          alt="Confirm the logout from a previous service."
        />
      </p>

      <h2 id="_Viewing_and_editing">Viewing and editing your own data</h2>

      <p>
        By authenticating to your Helsinki profile at
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>
        you can view and edit your data and how it is used by the services:
      </p>

      <p>You can add a phone number.</p>

      <p>change your email address.</p>

      <p>add your address information.</p>

      <p>
        The official information will be added to your profile and will only be
        visible when you authenticate with suomi.fi. Updating this information
        is done in the Population Register Centre service.
      </p>

      <p>
        If you update your name data in your Helsinki profile, the next time you
        authenticate with suomi.fi, the official data will be updated.
        <img
          src={image018}
          width={481}
          height={323}
          alt={`In the My Information section of the Helsinki profile, official information 
            comes directly from the Population Register Centre and is updated there as well.`}
        />
      </p>

      <p>
        <img
          src={image019}
          width={482}
          height={295}
          alt="In your Helsinki profile, in the My information section, you can update the basic data yourself."
        />
        You can add or change the information you have entered yourself by
        clicking on the Add button, or the Edit button if the information
        already exists. Press the Save button to save the data in the database.
        <img
          src={image020}
          width={482}
          height={346}
          alt="You can add and edit your other address details, your phone number and your email address."
        />
      </p>

      <p>
        In the Helsinki profile, the language of communication section
        determines the language in which, for example, emails from the service
        will be sent.
        <img
          src={image021}
          width={482}
          height={115}
          alt="The language of communication determines the language in which you receive messages from the service."
        />
      </p>

      <p>
        You can also see how you are authenticated to your Helsinki profile.
      </p>

      <p>
        <img
          src={image022}
          width={482}
          height={72}
          alt={`On the My information section of your Helsinki profile, the authentication 
            method tells you how you are logged in to the service, i.e. suomi.fi authentication 
            or an email/password combination, i.e. the Helsinki ID.`}
        />
      </p>

      <h2 id="_Processing_of_your">
        Processing of your data by different services
      </h2>

      <p>
        The services will use the data managed by the Helsinki Profile as
        indicated. The first time you authenticate to a service, you can see
        what information the service uses.
      </p>

      <p>
        <img
          src={image023}
          width={432}
          height={452}
          alt={`When you authenticate to the new service, you will be asked to 
            consent to the use of your data required by the service. &#10;You can 
            later return to this information on the Your services section of your Helsinki profile.`}
        />
      </p>

      <p>
        In your Helsinki profile, you can check this information later and, if
        you wish, delete your data from the service. It is not possible to
        delete your data if your service process has not been completed. It is
        also advisable to{' '}
        <a href="#_Download_your_information">download your own information</a>{' '}
        before deleting it.
        <img
          src={image024}
          width={482}
          height={472}
          alt={`In the Your services used section of your Helsinki profile, you can 
            see all the services you are authenticated to and what data they use. &#10;
            You can also delete your data from individual services.`}
        />
      </p>

      <h2 id="_Download_your_information">Download your information</h2>

      <p>
        You can also download the data you have stored in different services as
        a single json file. For more information on{' '}
        <a href="https://fi.wikipedia.org/wiki/JSON">
          the
          <u>json file format, see Wikipedia (link opens in a new window)</u>
        </a>
        .
      </p>

      <p>
        If you have combined the suomi.fi authentication and the email
        address+password login in the same Helsinki profile, the data download
        must be done with the suomi.fi authentication.
      </p>

      <p>
        <img
          src={image025}
          width={482}
          height={107}
          alt={`In the My information section of your Helsinki profile, 
            you can download your data for all services as a json file.`}
        />
      </p>

      <h2 id="_Deleting_your_information">
        Deleting your information from a single service or from your entire
        Helsinki profile{' '}
      </h2>

      <p>
        You can delete your data either for individual services or for your
        entire profile. When you select the service you want to delete on the
        Your services section, there will be a pop-up window with a confirmation
        message about the deletion. Upon deletion, all your data from the
        service will be deleted or anonymised if, for example, the service is
        required by law to retain it. However, you will not have access to the
        data after deletion nor will it be linked to you.
      </p>

      <p>
        If you have combined your suomi.fi authentication and email
        address+password login in the same Helsinki profile, you must delete the
        service while authenticated with suomi.fi.
      </p>

      <p>
        <img
          src={image026}
          width={482}
          height={237}
          alt={`You can delete your data in your Helsinki profile for an individual 
            service in the Your services section.`}
        />
      </p>

      <p>
        <img
          src={image027}
          width={481}
          height={233}
          alt={`After clicking on the "Delete your data from this service" button, you will 
            receive a pop-up confirmation message on the screen to prevent accidental deletion.`}
        />
      </p>

      <p>
        <img
          src={image028}
          width={448}
          height={245}
          alt="You will receive a confirmation message that the data has been removed from the service."
        />
      </p>

      <p>
        If you want to delete your entire Helsinki profile, you can do so by
        pressing the <i>Delete my information</i> button. You will then see a
        pop-up window where you will be asked to confirm that you want to delete
        your information. After confirming the request, all data will be deleted
        from the profile and from all services, if no service is pending.
      </p>

      <p>
        Some statutory services may require data to be retained for a limited or
        permanent period. Depending on the transaction and the service, data may
        be anonymized in some cases. If a statutory service is required to
        retain data, the profile or the data used by that service cannot be
        deleted.
      </p>

      <p>
        If you have combined the suomi.fi authentication and the email
        address+password login in the same Helsinki profile, you must delete the
        profile while authenticated with suomi.fi.
      </p>

      <p>
        After deleting your Helsinki profile, you can always create a new
        profile, if necessary, but all previous data will be lost.
      </p>
      <img
        src={image029}
        width={481}
        height={139}
        alt={`
            In the My information section of your Helsinki profile, there is a Delete my 
            information button that allows you to delete your entire Helsinki profile
             and your information used in different services.`}
      />

      <p>
        <img
          id="Kuva 1"
          src={image030}
          width={390}
          height={226}
          alt={`A confirmation message is also displayed in a pop-up window 
            to prevent accidental deletion of the data.`}
        />
      </p>
    </Fragment>
  );
}

export default UserGuideEn;
