import React, { Fragment, ReactElement } from 'react';

import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function AboutPageSv(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Om Helsingfors-profilen</FocusableH1>
      <p>
        Helsingforsprofilen är ett användar-ID och en lagringstjänst för person-
        och kontaktinformation. Den samlar kundens personuppgifter och kontakter
        till olika stadstjänster på ett och samma ställe.
      </p>
      <p>
        Helsingforsprofilen och dess autentisering i olika digitala
        applikationer:{' '}
      </p>
      <ul>
        <li>stark användning av suomi.fi-autentisering</li>
        <li>
          lätt användning av kombinationen e-postadress+lösenord för Helsinki ID{' '}
        </li>
      </ul>
      <p>
        Användningen av Helsingforsprofilen och de uppgifter som lagras i den
        baseras huvudsakligen på kundens samtycke för lätt autentisering och på
        en rättslig grund för stark autentisering.{' '}
      </p>
      <p>
        Helsingforsprofilen stöder principen om enkel inloggning (SSO). På så
        sätt kan en kund som redan är inloggad i en tjänst byta till en annan
        utan att behöva logga in igen, och samma kontaktuppgifter kommer att
        vara tillgängliga för båda tjänsterna. Den digitala tjänst som använder
        Helsingforsprofilen bestämmer vilken autentiseringsnivå som krävs av
        kunden: lätt eller stark.{' '}
      </p>
      <h2>Stark identifiering</h2>
      <p>
        Om användningen av tjänsten kräver officiella personuppgifter, erbjuds
        kunden stark autentisering till profilen via den centrala Suomi.
        fi-autentiseringstjänsten, så att officiella personuppgifter kan
        överföras till tjänsten.{' '}
      </p>
      <p>
        Som officiella personuppgifter lagrar Helsingforsprofilen de
        basuppgifter om kunden som erhållits via Suomi.fi i
        befolkningsdatasystemet, vilka omfattar
      </p>
      <ul>
        <li>officiellt förnamn och efternamn</li>
        <li>personbeteckning</li>
        <li>hemadress</li>
        <li>hemkommun</li>
      </ul>
      <p>
        Den officiella informationen visas också i Helsingforsprofilen för
        användare som är starkt identifierade. Kunden kan ändra sina uppgifter
        via processen för ändring av personuppgifter i det officiella
        befolkningsdatasystemet. Därför är det inte möjligt i
        Helsingforsprofilen.{' '}
      </p>
      <p>
        Officiella personuppgifter uppdateras från Finlands
        befolkningsdatasystem till Helsingforsprofilen vid varje inloggning på
        suomi.fi.
      </p>
      <p>
        Kunden ger sitt samtycke till att de olika digitala tjänsterna får
        använda informationen i profilen. Dessa applikationer kan begära det,
        till exempel som grund för att bevilja tjänster eller produkter.
      </p>
      <p>
        Det måste alltid finnas en rättslig grund för användning av stark
        autentisering, dvs. det kan inte krävas i alla fall vid användning av
        tjänsten. Däremot kan lätt autentisering erbjudas som en frivillig
        autentiseringsmetod.
      </p>
      <h2>Lätt identifiering</h2>
      <p>
        När det gäller autentisering innebär &quot;lättvikt&quot; att inga
        personuppgifter har verifierats formellt. Lätt autentisering innebär att
        profilen innehåller en verifierad e-postadress och ett verifierat
        lösenord för användaren.
      </p>
      <p>
        Denna autentiseringsmetod kan användas när inga officiella
        personuppgifter krävs. Till exempel kontaktuppgifter tillhandahålls av
        användaren, inte hämtas från officiella system. Kunden kan själv
        redigera uppgifterna i sin Helsingforsprofil. Denna information är
        alltid tillgänglig även utan stark autentisering.
      </p>
      <p>Lätta data (obligatoriska data är markerade med *) inkluderar</p>
      <ul>
        <li>namn som tillhandahålls av kunden *</li>
        <li>e-postadress *</li>
        <li>telefonnummer och</li>
        <li>adress</li>
      </ul>
      <p>
        E-postadressen kommer att verifieras genom ett bekräftelsemeddelande.
      </p>
      <p>
        Användaren kommer alltid att bli tillfrågad om samtycke till att använda
        sina Helsingfors-profildata när de går med i en ny tjänst. Dessa
        samtycken visas i avsnittet &quot;Dina tjänster&quot; i gränssnittet för
        Helsingforsprofilen. Du kan när som helst återkalla ditt samtycke.
      </p>
      <p>
        Användare kan redigera de personuppgifter som de anger i sin profil. De
        kan också hantera användningen av sina egna uppgifter mellan olika
        tjänster. De kan ladda ner sina uppgifter från olika tjänster eller
        radera sina uppgifter från en eller alla tjänster, t.ex. genom att
        radera hela sin profil.
      </p>
      <h2>Dataskydd</h2>
      <p>
        Uppgifterna lagras i Helsingfors-profilens databas, varifrån de överförs
        till olika tjänster baserat på kundens samtycke. I Helsingforsprofilen
        kan administratörsanvändare se och redigera de uppgifter som användaren
        har lämnat. Det finns mellan 3 och 7 sådana användare.
      </p>
      <p>
        Dessutom har medlemmarna i utvecklingsteamet tillgång till databasen för
        utveckling av Helsingforsprofilen och vid eventuella problem.
      </p>
      <p>Alla aktiviteter loggas.</p>
      <p>
        Personuppgifter, inklusive personnummer, kan överföras från gränssnittet
        för Helsingforsprofilen till kundtjänsterna, om tjänsten i fråga kräver
        denna information. Detta sker med användarens samtycke och behandlingen
        av dessa uppgifter beskrivs i registerbeskrivningen och
        användarvillkoren för den berörda tjänsten.
      </p>
      <p>
        Tjänsten Helsinki-profil finns i Helsingfors stads Azure-moln med
        servrar i Irland. De speglas inte till andra Azure-platser.
        Säkerhetskopiorna finns i Azure i samma region som själva servrarna.
        Inga personuppgifter behandlas utanför Helsingfors.
      </p>
      <p>
        Alla personuppgifter som behandlas i stadens molntjänst skyddas av
        lämpliga säkerhetsnycklar (Microsoft EU Data Boundary). Uppgifterna
        sparas i tio år efter händelsen, i enlighet med arkiveringstiden för
        kommunala register.
      </p>
      <p>
        Behandlingen av uppgifter i Helsingforsprofilen beskrivs i{' '}
        <Link
          // eslint-disable-next-line max-len
          href="https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Keha/Register%20over%20e-tjanster.pdf"
          external
          openInNewTab
        >
          Helsingfors stads dataskyddsbeskrivning för elektroniska tjänster.
        </Link>
      </p>
      <p>
        Mer information om{' '}
        <Link
          // eslint-disable-next-line max-len
          href="https://www.hel.fi/sv/beslutsfattande-och-forvaltning/information-om-helsingfors/dataskydd-och-informationshantering/dataskydd/den-registrerades-rattigheter-och-hur-man-kan-havda-dem"
          external
          openInNewTab
        >
          dina rättigheter enligt EU:s allmänna dataskyddsförordning på
          Helsingfors stads webbtjänster.
        </Link>
      </p>
      <p>
        I tjänsten används också stadens Matomo-lösning för besökaruppföljning,
        vars insamlade uppgifter beskrivs i avsnittet Kakor.{' '}
      </p>
      <h2>Om kakor</h2>
      <p>Den här webbplatsen använder webbkakor.</p>
      <p>
        En webbkaka (cookie) är filer som lagras av webbläsaren på användarens
        enhet. Kakor används för att möjliggöra funktioner som gör tjänsten
        enklare att använda och för att samla in information om användare i
        syfte att förbättra tjänsten. Kakor gör det möjligt för oss att ge dig
        en mer användarvänlig och funktionell webbplats som bättre uppfyller
        dina behov.
      </p>
      <p>
        När det gäller insamling av användardata innehåller kakor anonyma unika
        identifierare som gör det möjligt för oss att samla in information om
        användare som besöker vår webbplats, t.ex. information om deras
        webbläsare och enheter.
      </p>
      <p>
        Webbplatsadministratörer har inte tillgång till användarnas unika
        identifierare. Kakor ger oss information om vilka webbläsare som används
        på våra webbplatser och vilka sidor som oftast besöks.
      </p>
      <p>
        Användaren har möjlighet att kontrollera användningen av kakor genom ett
        kakor samtycke.
      </p>
      <p>
        Den information som Matomo samlar in för besöksstatistik är anonym och
        kan inte kopplas till någon enskild person. Denna information omfattar
      </p>
      <ul>
        <li>IP-adress</li>
        <li>Geografisk plats på stadsnivå</li>
        <li>Enhetsmodell och operativsystem</li>
        <li>Webbläsare som används</li>
        <li>Tid</li>
        <li>Sidor som går in i och ut ur tjänsten</li>
        <li>Besökta sidor och aktivitet på webbplatsen</li>
      </ul>
    </Fragment>
  );
}

export default AboutPageSv;
