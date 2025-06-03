/* eslint-disable max-len */
import React, { Fragment, ReactElement } from 'react';
import { IconDownload, Link } from 'hds-react';

import styles from './UserGuide.module.css';
import UserGuideAccordion from './UserGuideAccordion';
import UserGuideImage from './UserGuideImage';
import TableOfContents from '../profile/components/tableOfContents/TableOfContents';
import image001 from './assets/01-sisaankirjautuminen-sv.png';
import image003 from './assets/03-vahvan-valinta-sv.png';
import image004 from './assets/04-vahvat-tiedot-sv.png';
import image005 from './assets/05-10-sahkopostiosoite-sv.png';
import image006 from './assets/06-11-sahkopostin-vahvistuskoodi-sv.png';
import image007 from './assets/07-12-sahkopostin-vahvistus-sv.png';
import image008 from './assets/08-profiilin-luominen-sv.png';
import image009 from './assets/09-helsinki-tunnus-luonti-sv.png';
import image010 from './assets/13-helsinki-tunnus-teko-sv.png';
import image011 from './assets/14-salasanan-unohdus-sv.png';
import image012 from './assets/15-sahkoposti-salasanalle-sv.png';
import image013 from './assets/16-salasanan-vaihtopyynto-sv.png';
import image014 from './assets/17-salasanan-vaihtoviesti-sv.png';
import image015 from './assets/18-uusi-salasana-sv.png';
import image016 from './assets/19-yhteensopimaton-kirjautuminen-sv.png';
import image017 from './assets/20-kirjautumislogout-sv.png';
import image018 from './assets/21-omat-tiedot-sv.png';
import image019 from './assets/22-omat-nimitiedot-sv.png';
import image023 from './assets/23-omat-yhteystiedot-sv.png';
import image024 from './assets/24-olemassa-olevan-profiilin-kirjautuminen-sv.png';
import image025 from './assets/25-kayttamasi-palvelut-sv.png';
import image026 from './assets/26-tietojen-lataus-sv.png';
import image027 from './assets/27-tietojen-poisto-palvelusta-sv.png';
import image028 from './assets/28-tietojen-poisto-palvelusta-pop-up-sv.png';
import image029 from './assets/29-tietojen-poisto-sv.png';
import image030 from './assets/30-tietojen-poisto-popup-sv.png';
import image031 from './assets/01-salasana-vaihto-sve.png';
import image032 from './assets/02-salasana-vaihto-keycloak-sve.png';
import image2fa01 from './assets/01-2fa-kayttoonnotto-sv.jpg';
import image2fa02 from './assets/02-2fa-kayttoonotto-keycloak-sv.jpg';
import image2fa03 from './assets/03-2fa-kirjautuminen-sv.jpg';
import image2fa04 from './assets/04-2fa-kaytostapoisto-sv.jpg';
import image2fa05 from './assets/05-2fa-kaytostapoisto-varmistus-sv.jpg';
import FocusableH1 from '../common/focusableH1/FocusableH1';

const tableOfContents = [
  {
    title: 'Skapa en Helsingforsprofilen',
    href: '#_Create_a_Helsinki_profile',
  },
  {
    title: 'Logga in',
    href: '#_Login',
  },
  {
    title: 'Visa och redigera dina egna uppgifter',
    href: '#_viewing_and_editing',
  },
  {
    title: 'Radering av uppgifter',
    href: '#_Deleting_your_information',
  },
];

const lang = 'sv';

function UserGuideSv(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Helsingforsprofilens hjälp</FocusableH1>
      <p>
        Helsingforsprofilen är kundprofilen för en medborgare som använder
        stadens digitala tjänster. Den är det primära autentiseringsmedlet för
        stadens digitala tjänster. Helsingforsprofilen samlar kundens person-
        och kontaktuppgifter samt länkar till stadens olika tjänster på ett och
        samma ställe. Med hjälp av profilen kan användaren hantera sina egna
        uppgifter och deras synlighet i olika tjänster.
      </p>
      <Link
        href="/Helsingforsprofilens-hjalp.pdf"
        download="Helsingforsprofilens-hjalp.pdf"
        className={styles['download-link']}
        iconStart={<IconDownload />}
        useButtonStyles
      >
        Helsingforsprofilens hjälp (.pdf)
      </Link>

      <TableOfContents items={tableOfContents} heading="På den här sidan" />

      <h2 id="_Create_a_Helsinki_profile">Skapa en Helsingforsprofilen</h2>
      <p>
        Helsingfors-profilen används för att logga in i Helsingfors stads
        tjänster. Första gången du loggar in blir du ombedd att skapa en
        Helsingforsprofilen och ge ditt samtycke till att de uppgifter som
        tjänsten kräver får användas.
      </p>
      <p>
        Du kan också skapa en Helsingforsprofil på{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>.
      </p>
      <p>
        Du kan skapa en Helsingforsprofilen med din Suomi.fi-identifikation
        eller med din e-post och ditt lösenord. Du kan också logga in i
        Helsingfors stads digitala tjänster med Google eller Yle Konto, som tas
        ur bruk 2024.
      </p>
      <UserGuideAccordion
        language={lang}
        id="_Suomi.fi_identifiering"
        heading="Suomi.fi identifiering"
      >
        <h4>Val av autentisering</h4>
        <p>
          Efter att ha tryckt på länken Logga in i kundtjänsten visas en skärm
          med olika inloggningsalternativ, där inloggningen till Suomi.fi väljs.
          Visningen av inloggningsalternativen varierar från en tjänst till en
          annan.
        </p>
        <UserGuideImage
          src={image001}
          alt="I autentiseringsfönstret väljer du Suomi.fi-identifikation."
        />

        <h4>Identifiering i tjänsten Suomi.fi</h4>

        <p>
          Efter att ha valt Suomi.fi-inloggning presenteras användaren med olika
          inloggningsalternativ. Alternativen är desamma som för andra
          myndighetstjänster som erbjuder stark autentisering.
        </p>

        <p>
          Efter autentiseringen ska du kontrollera att de uppgifter du använder
          är korrekta. Om du hittar fel i uppgifterna ska de korrigeras i
          Befolkningsregistercentralens tjänst.
        </p>

        <UserGuideImage
          src={image003}
          alt="Välj ditt bank- eller mobilkonto som autentiseringsalternativ på Suomi.fi."
        />

        <UserGuideImage
          src={image004}
          alt="När du byter tillbaka till Helsingfors stads tjänst, kontrollera att dina uppgifter är korrekta."
        />

        <h4>Verifiering av e-postadress</h4>

        <p>
          Efter autentiseringen kommer du att bli ombedd att ange din
          e-postadress. Ett bekräftelsemeddelande skickas till e-postadressen
          för att verifiera att adressen är äkta.
        </p>

        <p>
          För att validera din e-post får du en sexsiffrig kod för den
          e-postadress du angav, som du måste ange i fältet på skärmen. I så
          fall kombineras de olika autentiseringsmetoderna och du kan se alla
          tjänster du använder på en gång.{' '}
          <b>
            Observera dock att du inte kommer att kunna koppla bort dem senare.
          </b>
        </p>

        <p>
          För att bekräfta din e-post får du en 6-siffrig kod till den
          e-postadress du angav. Om meddelandet inte kommer till din inbox
          nästan omedelbart, kontrollera din skräppostmapp.
        </p>

        <p>
          <b>
            Stäng inte webbläsarfönstret i din Helsingforsprofil när du hämtar
            bekräftelsemeddelandet från din e-post. I annat fall kommer systemet
            att anta att du har avbrutit autentiseringsprocessen.
          </b>
        </p>

        <UserGuideImage
          src={image005}
          alt={`Din e-postadress kommer att fungera som din inloggning till Helsingfors stads tjänster. Genom att 
            använda samma e-postadress för både Suomi.fi-autentiseringen och Helsingfors ID får du en 
            Helsingfors-profil. Sammanslagningen kan inte tas bort senare.`}
        />

        <UserGuideImage
          src={image006}
          alt="E-postmeddelandet innehåller en 6-siffrig verifieringskod för att bekräfta att e-postadressen är äkta."
        />

        <UserGuideImage
          src={image007}
          alt="Det 6-siffriga numret på e-postmeddelandet måste anges i fältet för bekräftelsekod i webbläsarfönstret."
        />

        <h4>Skapa en Helsingforsprofilen</h4>

        <p>
          När du har bekräftat e-postmeddelandet måste du fortfarande ge ditt
          samtycke till att dina uppgifter används. Utan samtycke kan
          Helsingforsprofilen inte skapas och tjänsterna kan inte använda dina
          uppgifter.
        </p>

        <p>
          Då har du Helsingforsprofilen och dina autentiseringsuppgifter för
          Suomi.fi sparas i din profil. Olika tjänster använder dina uppgifter
          på olika sätt, men de kommer alltid att berätta för dig hur de
          använder dem när du loggar in första gången. Informationen finns också
          alltid tillgänglig i din Helsingforsprofil.
        </p>

        <p>
          När du har skapat din Helsingforsprofil kommer du att vara inloggad på
          den tjänst där du inledde registreringsprocessen. Du hittar din
          Helsingforsprofil på adressen{' '}
          <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>.
        </p>

        <p>
          Nästa gång du loggar in på samma tjänst väljer du bara Suomi.fi, det
          autentiseringsalternativ du valt och du är inne i tjänsten.
        </p>

        <UserGuideImage
          src={image008}
          alt={`Innan du kan använda den tjänst du vill ha eller innan du kan skapa Helsingforsprofilen måste du 
          ge ditt samtycke till att dina uppgifter används. Utan samtycke kan dina uppgifter inte användas och 
          därför kan ingen profil skapas.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Identifiering_av_e-post"
        heading="Identifiering av e-post"
      >
        <h4>Val av autentisering</h4>
        <p>
          När du har tryckt på länken Logga in i kundtjänsten ser du olika
          inloggningsalternativ, där du kan välja Skapa Helsingforsprofil.
          Visningen av inloggningsalternativen varierar från en tjänst till en
          annan.
        </p>

        <UserGuideImage
          src={image009}
          alt="Helsingfors ID består av en kombination av e-post och lösenord genom att klicka på knappen Skapa ny Helsingforsprofilen."
        />

        <h4>Verifiering av e-postadress</h4>

        <p>
          Du kommer att bli ombedd att ange din e-postadress, till vilken ett
          bekräftelsemeddelande kommer att skickas för att verifiera adressens
          äkthet.
        </p>

        <p>
          Om du redan har skapat Helsingforsprofilen med Suomi.fi-autentisering,
          kan du skapa ett lösenord för din profil genom att klicka på länken
          Jag har glömt mitt lösenord. Mer information om hur du skapar ett
          lösenord finns under <a href="#_Glömt_lösenord">Glömt lösenord</a>. De
          olika autentiseringsmetoderna kommer sedan att slås samman och du
          kommer att kunna se all information om alla de tjänster du använder på
          en gång.{' '}
          <b>
            Observera dock att du inte kommer att kunna avbryta sammanslagningen
            senare.
          </b>
        </p>

        <p>
          För att validera din e-postadress får du en 6-siffrig kod till den
          e-postadress du angav. Om meddelandet inte kommer till din inkorg
          nästan omedelbart, kontrollera din skräppostmapp.
        </p>

        <p>
          <b>
            Stäng inte webbläsarfönstret i din Helsingforsprofil när du hämtar
            bekräftelsemeddelandet från din e-post.
          </b>
          <b>
            I annat fall kommer systemet att anta att du har avbrutit
            autentiseringsprocessen.
          </b>
        </p>

        <UserGuideImage
          src={image005}
          alt={`Din e-postadress kommer att fungera som din inloggning till Helsingfors stads tjänster. Genom att 
            använda samma e-postadress för både Suomi.fi-autentiseringen och Helsingfors ID får du en 
            Helsingfors-profil. Sammanslagningen kan inte tas bort senare.`}
        />

        <UserGuideImage
          src={image006}
          alt={`E-postmeddelandet innehåller en 6-siffrig verifieringskod för att bekräfta att e-postadressen är äkta.`}
        />

        <UserGuideImage
          src={image007}
          alt="Det 6-siffriga numret på e-postmeddelandet måste anges i fältet för bekräftelsekod i webbläsarfönstret."
        />

        <h4>Skapa en Helsingforsprofilen</h4>

        <p>
          När du har bekräftat e-postmeddelandet fyller du i ditt namn och
          lösenord. Ditt lösenord måste vara minst 12 tecken långt och innehålla
          stora och små bokstäver, siffror och specialtecken.
        </p>

        <p>
          Bekräfta att du samtycker till användningen av dina uppgifter. Utan
          ditt samtycke kan din Helsingforsprofil inte skapas och dina uppgifter
          kan inte användas av tjänsterna.
        </p>

        <p>
          Nu har du Helsingforsprofilen. Det Helsingfors-ID du behöver för att
          autentisera dig till tjänsterna är denna kombination av e-postadress
          och lösenord.
        </p>

        <UserGuideImage
          src={image010}
          alt={`När du skapar Helsingforsprofilen måste du fortfarande fylla i ditt namn och lösenord. Du måste 
            också ge ditt samtycke till att dina uppgifter används för att skapa Helsingforsprofilen.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Kombinera_identifieringsmetoder"
        heading="Kombinera identifieringsmetoder"
      >
        <p>
          Om du vill kan du kombinera olika autentiseringsmetoder i en enda
          Helsingforsprofil, så att du kan se och hantera alla dina data och
          tjänster på en gång. Detta kan göras genom att först skapa ett
          Helsingfors-ID med en e-postadress/lösenordskombination och sedan
          använda samma e-postadress för den första Suomi.fi-inloggningen.
        </p>

        <p>
          <b>
            Observera dock att du inte kommer att kunna koppla bort dem senare.
          </b>
        </p>

        <p>
          Om din Helsingforsprofil skapades med en Suomi.fi-autentisering kan du
          klicka på länken <i>Jag har glömt mitt lösenord </i>
          på inloggningsskärmen. För instruktioner om hur du gör detta, se
          avsnittet <a href="#_Glömt_lösenord">Glömt lösenord</a> nedan.
        </p>
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Kaksivaiheinen_tunnistautuminen"
        heading="Tvåfaktorsautentisering"
      >
        <p>
          Tvåfaktorsautentisering ökar säkerheten för ditt konto. När du
          aktiverar den krävs förutom ett lösenord en separat engångskod för att
          logga in på din Helsingforsprofil, som du hämtar från
          autentiseringsappen.
        </p>

        <h4>Så här aktiverar du tvåfaktorsautentisering</h4>

        <p>
          På sidan Mina uppgifter i din profil kan du aktivera
          tvåfaktorsautentisering i avsnittet Inloggning och autentisering.
        </p>

        <UserGuideImage
          src={image2fa01}
          alt="Tvåfaktorsautentisering på sidan Min information."
        />

        <UserGuideImage
          src={image2fa02}
          alt="Vy för aktivering av tvåfaktorsautentisering. Följ de numrerade instruktionerna."
        />
        <p>
          Följ installationsanvisningarna och ladda ner en valfri
          autentiseringsapp, t.ex. Google Authenticator, Microsoft Authenticator
          eller FreeOTP, till din mobila enhet.
        </p>
        <p>
          Öppna autentiseringsappen och skanna QR-koden på skärmen. Om du inte
          kan skanna koden kan du ange den manuellt genom att välja länken ”Kan
          du inte läsa koden?”.
        </p>
        <p>
          <b>
            Om det skulle uppstå problem, t.ex. att din telefon går sönder,
            spara koden som öppnas från länken så att du ändå kan komma åt ditt
            konto.
          </b>
        </p>
        <p>
          Autentiseringsappen genererar en engångskod, som du anger i
          Helsingfors profilvy i steg 3.
        </p>
        <p>
          <b>
            Stäng inte webbläsarfönstret för din Helsingforsprofil, när du
            hämtar engångskoden från din autentiseringsapplikation. I annat fall
            kommer systemet att anta att du har avbrutit aktiveringsprocessen.
          </b>
        </p>
        <p>
          När verifieringen har lyckats, är tvåstegsautentiseringen aktiverad
          och du ser att den är aktiverad på sidan Mina uppgifter.
        </p>

        <h4>Logga in med tvåfaktorsautentisering</h4>

        <p>
          Om ditt konto har tvåfaktorsautentisering aktiverad, när du loggar in
          via e-post, kommer du att uppmanas av systemet att ange en engångskod,
          som genereras av din tidigare definierade autentiseringsapplikation.
        </p>

        <UserGuideImage
          src={image2fa03}
          alt="Hämta och klistra in engångskoden från din autentiseringsapplikation i den här vyn."
        />

        <p>
          Gå till din autentiseringsapplikation, kopiera koden och klistra in
          den i vyn Profilinloggning. Koden är vanligtvis giltig i en minut.
        </p>

        <p>
          <b>
            Stäng inte webbläsarfönstret för din Helsingforsprofil, när du
            hämtar engångskoden från din autentiseringsapp. I annat fall antar
            systemet att du har avbrutit inloggningsprocessen.
          </b>
        </p>
        <p>
          Om du inte har tillgång till din autentiseringsapp kan du logga in på
          din profil med suomi.fi och följa anvisningarna i avsnittet{' '}
          <a href="#_Todennus_sovellus_ei">
            Autentiseringsappen är inte tillgänglig eller koden fungerar inte.
          </a>
        </p>

        <h4>Inaktivera tvåfaktorsautentisering</h4>

        <p>
          Du kan inaktivera tvåfaktorsautentisering på sidan Mina uppgifter.
        </p>

        <UserGuideImage
          src={image2fa04}
          alt="Inaktivera tvåfaktorsautentisering genom att klicka på knappen ”Inaktivera”."
        />

        <p>
          Systemet kommer att be dig bekräfta avaktiveringen med dina
          inloggningsuppgifter och en engångskod från
          autentiseringsapplikationen.
        </p>

        <UserGuideImage
          src={image2fa05}
          alt="Bekräftelse på inaktivering av tvåfaktorsautentisering."
        />

        <p>
          Efter borttagningen måste du också ta bort länken/kontot som är
          kopplat till din Helsingforsprofil från din autentiseringsapplikation.
        </p>

        <p>
          Du kan när som helst återaktivera tvåfaktorsautentisering från
          profiluppgifterna.
        </p>
        <p>
          Om du har ett så kallat hybridkonto med både lätt autentisering och
          stark suomi.fi-autentisering, kan du också inaktivera
          tvåfaktorsautentisering med suomi.fi-autentisering.
        </p>

        <h4 id="_Todennus_sovellus_ei">
          Autentiseringsapplikationen är inte tillgänglig eller koden fungerar
          inte
        </h4>

        <p>
          Om du inte har tillgång till din autentiseringsapp, till exempel för
          att du har bytt telefon, kan du autentisera dig på din
          Helsingforsprofil med ett starkt suomi.fi-ID, så att du kan inaktivera
          tvåstegsautentisering på sidan Mina uppgifter.
        </p>
        <p>
          Om du ännu inte har en suomi.fi-autentisering kan du aktivera den
          genom att logga in med suomi.fi och skapa ett konto för stark
          autentisering med samma e-postadressen. Med samma e-postadressen
          kombineras lätt och stark autentisering och du kan inaktivera
          tvåstegsautentisering.
        </p>
        <p>
          Om du redan har en suomi.fi-autentisering med en annan e-postadress
          kan du tyvärr inte längre inaktivera tvåstegsinloggningen.{' '}
          <b>
            Därför är det mycket viktigt att spara den första
            autentiseringskoden.
          </b>
        </p>
      </UserGuideAccordion>

      <h2 id="_Login">Logga in</h2>
      <p>
        Med din Helsingforsprofil kan du logga in på alla Helsingfors stads
        digitala tjänster. Du kan logga in med Suomi.fi-inloggningen eller med
        den e-postadress och det lösenord som du angav när du skapade din
        profil.
      </p>
      <UserGuideAccordion
        language={lang}
        id="_Glömt_lösenord"
        heading="Glömt lösenord"
      >
        <p>
          Om du inte kommer ihåg ditt lösenord kan du skapa ett nytt i
          inloggningsfönstret genom att klicka på länken{' '}
          <i>Jag har glömt mitt lösenord</i>. Du kan också ha &quot;glömt&quot;
          ditt lösenord eftersom du tidigare har loggat in i tjänsten via
          Suomi.fi autentisering och då inte behövt ange ett lösenord.
        </p>

        <p>
          När du har angett din e-postadress kommer du att få en länk för att
          ange ett nytt lösenord i din e-post. Länken kommer att vara giltig i
          30 minuter.
        </p>

        <p>
          Lösenordet måste vara minst 12 tecken långt. Det måste innehålla både
          stora och små bokstäver, nummer och specialtecken.
        </p>

        <UserGuideImage
          src={image011}
          alt="I inloggningsfönstret klickar du på länken Jag har glömt mitt lösenord."
        />

        <UserGuideImage
          src={image012}
          alt="Ange din e-postadress i rutan som visas för att få en länk till förnyat lösenord i din e-post."
        />

        <UserGuideImage
          src={image013}
          alt="Du kommer att informeras om att ett e-postmeddelande kommer att skickas till dig för att förnya ditt lösenord."
        />

        <UserGuideImage
          src={image014}
          alt={`I det e-postmeddelande du får kommer det att finnas en länk för att ange ett nytt lösenord. Länken 
            kommer att vara giltig i 30 minuter.`}
        />

        <UserGuideImage
          src={image015}
          alt={`I fönstret för lösenordsändring måste du ange samma lösenord två gånger. Lösenordet måste vara minst 
            12 tecken långt. Lösenordet måste innehålla både stora och små bokstäver, nummer och specialtecken.`}
        />
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Salasanan_vaihto"
        heading="Uppdatera lösenord"
      >
        <p>
          Du kan när som helst ändra ditt lösenord till ett nytt från avsnittet
          Inloggning och autentisering på sidan Mina uppgifter.
        </p>

        <UserGuideImage
          src={image031}
          alt="Uppdatera lösenord på sidan Mina uppgifter."
        />

        <p>
          Om ditt konto har tvåfaktorsautentisering, behöver du en engångskod
          från din autentiseringsapplikation för att ändra ditt lösenord. För
          hjälp med problem med tvåfaktorsautentisering, se avsnittet{' '}
          <i>“Tvåfaktorsautentisering”</i> i den här guiden.
        </p>

        <UserGuideImage
          src={image032}
          alt="Tryck på ögonikonen för att visa eller dölja lösenordet i vyn."
        />

        <p>
          Ange det nya lösenord som du väljer i fältet. Lösenordet måste vara
          minst 12 tecken långt. Lösenordet måste innehålla både stora och små
          bokstäver, siffror och specialtecken. Tryck på ögonsymbolen för att
          visa eller dölja lösenordet.
        </p>
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Problem_med_identifiering"
        heading="Problem med identifiering"
      >
        <p>
          När du flyttar från en tjänst till en annan kan autentiseringen vara
          olika för de olika tjänsterna. Du loggade t.ex. in på den första
          tjänsten med ditt Helsingforsprofil, dvs. en kombination av e-post och
          lösenord, men den andra tjänsten kräver att du identifierar dig med
          Suomi.fi. I så fall får du ett meddelande om att autentiseringsmetoden
          inte är kompatibel. Du måste logga ut från den tidigare tjänsten för
          att autentisera dig i den nya tjänsten. Två olika
          autentiseringsmetoder kan inte vara öppna samtidigt.
        </p>

        <UserGuideImage
          src={image016}
          alt={`En inkompatibel inloggningsmetod innebär för exempel att du har loggat in på en tjänst med en 
            kombination av e-post och lösenord och går vidare till nästa tjänst, som kräver en Suomi.fi-autentisering. 
            I detta fall måste du logga ut från den första tjänsten för att kunna autentisera dig till den nya tjänsten.`}
        />

        <UserGuideImage
          src={image017}
          alt="Bekräfta din utloggning från en tidigare tjänst."
        />
      </UserGuideAccordion>

      <h2 id="_viewing_and_editing">Visa och redigera dina egna uppgifter</h2>
      <p>
        Genom att logga in på din Helsingforsprofil på{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>
        kan du se och redigera dina uppgifter och hur de används av tjänsterna.
      </p>

      <UserGuideAccordion
        language={lang}
        id="_Redigera_profilinformation"
        heading="Redigera profilinformation"
      >
        <p>
          De officiella uppgifterna läggs till i din profil och syns endast när
          du autentiserar dig med Suomi.fi. Uppdateringen av uppgifterna görs i
          Befolkningsregistercentralens tjänst.
        </p>

        <p>
          I avsnittet Personuppgifter i din Helsingforsprofil kan du lägga till
          ett telefonnummer, ändra din e-postadress och lägga till
          adressuppgifter. Om du uppdaterar dina namnuppgifter i din
          Helsingforsprofil, kommer de officiella uppgifterna att uppdateras
          nästa gång du autentiserar dig in med Suomi.fi.
        </p>

        <p>
          Du kan lägga till eller ändra information som du själv har lagt in
          genom att klicka på knappen Lägg till, eller på knappen Redigera om
          informationen redan finns. Tryck på knappen Spara för att spara
          uppgifterna i databasen.
        </p>

        <p>
          I Helsingforsprofilen bestämmer avsnittet om tjänstens kontaktspråk på
          vilket språk t.ex. e-post från tjänsten ska skickas. Du kan också se
          hur du är autentiserad dig på din Helsingforsprofil.
        </p>

        <UserGuideImage
          src={image018}
          alt={`I avsnittet Min information i Helsingforsprofilen kommer officiella uppgifter direkt från 
            Befolkningsregistercentralen och uppdateras också där.`}
        />

        <UserGuideImage
          src={image019}
          alt="I din Helsingforsprofil kan du uppdatera din basuppgifter i avsnittet Min information."
        />

        <UserGuideImage
          src={image023}
          alt={`Du kan lägga till och redigera dina andra adressuppgifter, ditt telefonnummer och din e-postadress. 
            Tjänstens kontaktspråk avgör på vilket språk du tar emot meddelanden från tjänsten. Den 
            autentiseringsmetoden hur du är inloggad i tjänsten, dvs. Suomi.fi-autentisering eller en kombination 
            av e-post och lösenord, dvs. Helsingfors-ID.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Olika_tjänsters_bearbetning"
        heading="Olika tjänsters bearbetning av dina uppgifter"
      >
        <p>
          Tjänsterna kommer att använda de uppgifter som hanteras av
          Helsingforsprofilen enligt vad som anges. Första gången du
          identifierar dig i en tjänst kan du se vilka uppgifter tjänsten
          använder.
        </p>

        <p>
          I din Helsingforsprofil kan du kontrollera denna information senare
          och, om du vill, radera dina uppgifter från tjänsten. Det är inte
          möjligt att radera dina uppgifter om du befinner dig mitt i
          serviceprocessen. Det är också tillrådligt att{' '}
          <a href="#_Ladda_ner_din">ladda ner dina egna information</a> innan du
          raderar dem.
        </p>

        <UserGuideImage
          src={image024}
          alt={`När du identifierar dig för en ny tjänst kommer du att bli ombedd att godkänna den användning av 
            dina uppgifter som tjänsten kräver. Du kan senare återvända till denna information på avsnittet Dina 
            tjänster i din Helsingforsprofil.`}
        />

        <UserGuideImage
          src={image025}
          alt={`I avsnittet Dina tjänster i din Helsingforsprofil kan du se alla tjänster som du är autentiserad 
          dig på och vilka data de använder. Du kan också radera dina uppgifter från enskilda tjänster.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Ladda_ner_din"
        heading="Ladda ner din information"
      >
        <p>
          Du kan ladda ner data som du har lagrat i olika tjänster som en enda
          json-fil. Mer information om{' '}
          <a href="https://sv.wikipedia.org/wiki/JSON">
            filformatet json finns på Wikipedia (länken öppnas i ett nytt
            fönster)
          </a>
          .
        </p>

        <p>
          Om du har kombinerat din Suomi.fi-autentisering och inloggning med
          e-postadress + lösenord i samma Helsingforsprofil, måste
          datanerladdningen göras med Suomi.fi-autentiseringen.
        </p>

        <UserGuideImage
          src={image026}
          alt="I avsnittet Min information i din Helsingforsprofil kan du ladda ner din information för alla tjänster som en json-fil."
        />
      </UserGuideAccordion>

      <h2 id="_Deleting_your_information">Radering av uppgifter</h2>
      <p>
        Du kan radera dina uppgifter antingen för enskilda tjänster eller för
        hela din profil. Vid radering kommer alla dina uppgifter från tjänsten
        att raderas eller anonymiseras om tjänsten till exempel är skyldig
        enligt lag att behålla dem. Du kommer dock inte att ha tillgång till
        uppgifterna efter raderingen och de kommer inte att kunna kopplas till
        dig.
      </p>

      <UserGuideAccordion
        language={lang}
        id="_Radera_dina_uppgifter"
        heading="Radering av uppgifter från en och samma tjänst"
      >
        <p>
          Om du har kombinerat din Suomi.fi-autentisering och inloggning med
          e-postadress och lösenord i samma Helsingforsprofil, måste du radera
          tjänsten medan du är autentiserad dig med Suomi.fi.
        </p>

        <p>
          När du väljer den tjänst som du vill ta bort på fliken Dina tjänster
          får du ett popup-meddelande som bekräftar borttagningen.
        </p>

        <UserGuideImage
          src={image027}
          alt="Du kan radera dina uppgifter i din Helsingforsprofil för en enskild tjänst i avsnittet Dina tjänster."
        />

        <UserGuideImage
          src={image028}
          alt={`När du klickar på knappen "Ta bort dina uppgifter från denna tjänst" får du ett 
            popup-bekräftelsemeddelande på skärmen för att förhindra oavsiktlig radering av dina uppgifter.`}
        />
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Radera_din_Helsingforsprofil"
        heading="Radera din Helsingforsprofil"
      >
        <p>
          Om du vill radera hela din Helsingforsprofil kan du göra det genom att
          trycka på knappen <i>Radera min information</i>. Du kommer då att se
          ett popup-fönster där du ombeds bekräfta att du vill radera din
          information. När du har bekräftat begäran raderas alla uppgifter från
          profilen och från alla tjänster, om ingen tjänst är på gång.
        </p>

        <p>
          Vissa lagstadgade tjänster kan kräva att uppgifter sparas under en
          begränsad eller permanent period. Beroende på transaktionen och
          tjänsten kan uppgifterna i vissa fall anonymiseras. Om en lagstadgad
          tjänst kräver att uppgifter sparas, kan profilen eller tjänstens
          tillgång till uppgifterna inte raderas.
        </p>

        <p>
          Om du har kombinerat din Suomi.fi-autentisering och inloggning med
          e-postadress och lösenord i samma Helsingforsprofil, måste du radera
          profilen medan du är autentiserad dig med Suomi.fi.
        </p>

        <p>
          Efter att du har raderat din Helsingforsprofil kan du alltid skapa en
          ny profil vid behov, men alla tidigare uppgifter försvinner.
        </p>

        <UserGuideImage
          src={image029}
          alt={`I avsnittet Min information i din Helsingforsprofil finns knappen Radera min information, med vilken 
            du kan radera hela din Helsingforsprofil och den information som du har använt i olika tjänster.`}
        />

        <UserGuideImage
          src={image030}
          alt={`Ett bekräftelsemeddelande visas också i ett popup-fönster för att förhindra oavsiktlig radering av data.`}
        />
      </UserGuideAccordion>
    </Fragment>
  );
}

export default UserGuideSv;
