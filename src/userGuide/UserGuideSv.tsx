/* eslint-disable max-len */
import React, { Fragment, ReactElement } from 'react';

import image001 from './assets/01-sisaankirjautuminen-sv.png';
import image002 from './assets/02-sisaankirjautuminen-tunnistamo-sv.png';
import image003 from './assets/03-vahvan-valinta-sv.png';
import image004 from './assets/04-vahvat-tiedot-sv.png';
import image005 from './assets/05-10-sahkopostiosoite-sv.png';
import image006 from './assets/06-11-sahkopostin-vahvistuskoodi.png';
import image007 from './assets/07-12-sahkopostin-vahvistus-sv.png';
import image008 from './assets/08-profiilin-luominen-sv.png';
import image009 from './assets/09-helsinki-tunnus-luonti-sv.png';
import image010 from './assets/13-helsinki-tunnus-teko-sv.png';
import image011 from './assets/14-salasanan-unohdus-sv.png';
import image012 from './assets/15-sahkoposti-salasanalle-sv.png';
import image013 from './assets/16-salasanan-vaihtopyynto.png';
import image014 from './assets/17-salasanan-vaihtoviesti-sv.png';
import image015 from './assets/18-uusi-salasana-sv.png';
import image016 from './assets/19-yhteensopimaton-kirjautuminen-sv.png';
import image017 from './assets/20-kirjautumislogout.png';
import image018 from './assets/21-omat-tiedot-sv.png';
import image019 from './assets/22-omat-nimitiedot-sv.png';
import image020 from './assets/23-omat-yhteystiedot-sv.png';
import image021 from './assets/24-asiointikieli-sv.png';
import image022 from './assets/25-kirjautumistapa-sv.png';
import image023 from './assets/26-olemassa-olevan-profiilin-kirjautuminen-sv.png';
import image024 from './assets/27-kayttamasi-palvelut-sv.png';
import image025 from './assets/28-tietojen-lataus-sv.png';
import image026 from './assets/29-tietojen-poisto-palvelusta-sv.png';
import image027 from './assets/30-tietojen-poisto-palvelusta-pop-up-sv.png';
import image028 from './assets/31-tietojen-poisto-palvelusta-pop-up-varmistusviesti-sv.png';
import image029 from './assets/32-tietojen-poisto-sv.png';
import image030 from './assets/33-tietojen-poisto-popup-sv.png';
import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

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
        uppgifter och deras synlighet i olika tjänster. Helsingforsprofilen
        används för identifiering i olika digitala applikationer:
      </p>

      <ul>
        <li>med suomi.fi-autentisering, till exempel med dina bankuppgifter</li>

        <li>
          med kombinationen av e-postadress och lösenord för Helsingfors ID,
          Google- eller Yle-ID
        </li>
      </ul>

      <ul>
        <li>
          <a href="#_Identifiering_till_tjänsten">
            Identifiering till tjänsten
          </a>
        </li>
        <ul>
          <li>
            <a href="#_Suomi.fi_identifiering">Suomi.fi identifiering</a>
          </li>

          <li>
            <a href="#_Identifiering_via_e-post">
              Identifiering via e-post och lösenord
            </a>
          </li>
        </ul>
        <li>
          <a href="#_Kombinera_identifieringsmetoder">
            Kombinera identifieringsmetoder
          </a>
        </li>

        <li>
          <a href="#_Glömt_lösenord">Glömt lösenord</a>
        </li>

        <li>
          <a href="#_Problem_med_identifiering">Problem med identifieringen</a>
        </li>

        <li>
          <a href="#_Visa_och_redigera">
            Visa och redigera dina egna uppgifter
          </a>
        </li>

        <li>
          <a href="#_Olika_tjänsters_bearbetning">
            Olika tjänsters bearbetning av dina uppgifter
          </a>
        </li>

        <li>
          <a href="#_Ladda_ner_din">Ladda ner din information</a>
        </li>

        <li>
          <a href="#_Radera_dina_uppgifter">
            Radera dina uppgifter från en enda tjänst eller från hela din
            Helsingforsprofil
          </a>{' '}
        </li>
      </ul>
      <h2 id="_Identifiering_till_tjänsten">Identifiering till tjänsten</h2>

      <p>
        Det vanligaste sättet att använda Helsingforsprofilen är att logga in på
        en av Helsingfors stads tjänster, där Helsingforsprofilen fungerar som
        en proxy för person- eller kontaktinformation.
      </p>

      <p>
        Första gången du loggar in blir du ombedd att skapa Helsingforsprofilen.
        Samtidigt ombeds du ge ditt samtycke till användningen av de uppgifter
        som tjänsten kräver.
      </p>

      <p>
        Du kan identifiera dig i tjänsten antingen genom att använda suomi.fi,
        t.ex. dina bankuppgifter, eller genom att använda en e-postadress och
        ett lösenord.{' '}
      </p>

      <h3 id="_Suomi.fi_identifiering">Suomi.fi identifiering</h3>

      <p>
        Efter att ha tryckt på länken Logga in i kundtjänsten visas en skärm med
        olika inloggningsalternativ, där inloggningen till suomi.fi väljs.
        Visningen av inloggningsalternativen varierar från en tjänst till en
        annan.
        <img
          width={219}
          height={397}
          src={image001}
          alt="I autentiseringsfönstret väljer du suomi.fi-identifikation."
        />
      </p>

      <p>
        <img
          width={403}
          height={252}
          src={image002}
          alt="I autentiseringsfönstret väljer du suomi.fi-identifikation.&#10;"
        />
      </p>

      <p>
        Efter att ha valt Suomi.fi-inloggning presenteras användaren med olika
        inloggningsalternativ. Alternativen är desamma som för andra
        myndighetstjänster som erbjuder stark autentisering.
      </p>

      <p>
        <img
          width={482}
          height={395}
          src={image003}
          alt="Välj ditt bank- eller mobilkonto som autentiseringsalternativ på suomi.fi.&#10;"
        />
      </p>

      <p>
        Efter autentiseringen ska du kontrollera att de uppgifter du använder är
        korrekta. Om du hittar fel i uppgifterna ska de korrigeras i
        Befolkningsregistercentralens tjänst.
      </p>

      <p>
        <img
          width={467}
          height={324}
          src={image004}
          alt="När du byter tillbaka till Helsingfors stads tjänst, kontrollera att dina uppgifter är korrekta."
        />
      </p>

      <p>
        Efter autentiseringen kommer du att bli ombedd att ange din
        e-postadress, som du måste bekräfta.
      </p>

      <p>
        Om du redan har skapat Helsingforsprofilen med en e-postadress och ett
        lösenord kan du använda samma e-postadress. I så fall kombineras de
        olika autentiseringsmetoderna och du kan se alla tjänster du använder på
        en gång.{' '}
        <b>
          Observera dock att du inte kommer att kunna koppla bort dem senare.
        </b>
      </p>

      <p>
        <img
          width={391}
          height={494}
          src={image005}
          alt="Din e-postadress kommer att fungera som din inloggning till Helsingfors stads tjänster. Genom att använda samma e-postadress för både suomi.fi-autentiseringen och Helsingfors ID får du en Helsingfors-profil. Sammanslagningen kan inte tas bort senare."
        />
      </p>

      <p>
        För att bekräfta din e-post får du en 6-siffrig kod till den
        e-postadress du angav. Om meddelandet inte kommer till din inbox nästan
        omedelbart, kontrollera din skräppostmapp.
      </p>

      <p>
        <b>
          Stäng inte webbläsarfönstret i din Helsingforsprofil när du hämtar
          bekräftelsemeddelandet från din e-post. I annat fall kommer systemet
          att anta att du har avbrutit autentiseringsprocessen.
        </b>
      </p>

      <p>
        <img
          width={482}
          height={323}
          src={image006}
          alt="E-postmeddelandet innehåller en 6-siffrig verifieringskod för att bekräfta att e-postadressen är äkta."
        />
      </p>

      <p>Ange numret i rutan på skärmen.</p>

      <p>
        <img
          width={433}
          height={520}
          src={image007}
          alt="Det 6-siffriga numret på e-postmeddelandet måste anges i fältet för bekräftelsekod i webbläsarfönstret."
        />
      </p>

      <p>
        När du har bekräftat e-postmeddelandet måste du fortfarande ge ditt
        samtycke till att dina uppgifter används. Utan samtycke kan
        Helsingforsprofilen inte skapas och tjänsterna kan inte använda dina
        uppgifter.
        <img
          width={212}
          height={482}
          src={image008}
          alt="Innan du kan använda den tjänst du vill ha eller innan du kan skapa Helsingforsprofilen måste du ge ditt samtycke till att dina uppgifter används. &#10;Utan samtycke kan dina uppgifter inte användas och därför kan ingen profil skapas."
        />
      </p>

      <p>
        Då har du Helsingforsprofilen och dina autentiseringsuppgifter för
        suomi.fi sparas i din profil. Olika tjänster använder dina uppgifter på
        olika sätt, men de kommer alltid att berätta för dig hur de använder dem
        när du loggar in första gången. Informationen finns också alltid
        tillgänglig i din Helsingforsprofil.
      </p>

      <p>
        När du har skapat din Helsingforsprofil kommer du att vara inloggad på
        den tjänst där du inledde registreringsprocessen. Du hittar din
        Helsingforsprofil på adressen{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>.
      </p>

      <p>
        Nästa gång du loggar in på samma tjänst väljer du bara suomi.fi, det
        autentiseringsalternativ du valt och du är inne i tjänsten.
      </p>

      <h3 id="_Identifiering_via_e-post">
        Identifiering via e-post och lösenord
      </h3>

      <p>De andra autentiseringsalternativen för Helsingforsprofilen är</p>

      <ul>
        <li>Helsinki ID, dvs. en kombination av e-post och lösenord</li>

        <li>Google- eller Yle-ID kommer att fasas ut 2024</li>
      </ul>
      <p>
        <img
          width={349}
          height={509}
          src={image009}
          alt="Helsingfors ID består av en kombination av e-post och lösenord genom att klicka på knappen Skapa ny Helsingforsprofilen."
        />
      </p>

      <p>
        Du kommer att bli ombedd att ange din e-postadress, till vilken ett
        bekräftelsemeddelande kommer att skickas för att verifiera adressens
        äkthet.
      </p>

      <p>
        Om du redan har skapat Helsingforsprofilen med suomi.fi-autentisering,
        kan du skapa ett lösenord för din profil genom att klicka på länken Jag
        har glömt mitt lösenord.{' '}
      </p>

      <p>
        Mer information om hur du skapar ett lösenord finns under{' '}
        <a href="#_Glömt_lösenord">Glömt lösenord</a>.
      </p>

      <p>
        I det här fallet finns både de tjänster som kräver
        suomi.fi-autentisering och inloggning med e-postlösenord i samma
        Helsingforsprofilen och du kan hantera all din information i en vy.{' '}
        <b>
          Observera dock att du inte kommer att kunna avbryta sammanslagningen
          senare.
        </b>
      </p>

      <p>
        <img
          width={391}
          height={494}
          src={image005}
          alt="Din e-postadress kommer att fungera som din inloggning till Helsingfors stads tjänster. Genom att använda samma e-postadress för både suomi.fi-autentiseringen och Helsingfors ID får du en Helsingfors-profil. Sammanslagningen kan inte tas bort senare."
        />
      </p>

      <p>
        För att validera din e-postadress får du en 6-siffrig kod till den
        e-postadress du angav. Om meddelandet inte kommer till din inkorg nästan
        omedelbart, kontrollera din skräppostmapp.
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

      <p>
        <img
          width={482}
          height={323}
          src={image006}
          alt="E-postmeddelandet innehåller en 6-siffrig verifieringskod för att bekräfta att e-postadressen är äkta."
        />
      </p>

      <p>Ange numret i rutan på skärmen.</p>

      <p>
        <img
          width={433}
          height={520}
          src={image007}
          alt="Det 6-siffriga numret på e-postmeddelandet måste anges i fältet för bekräftelsekod i webbläsarfönstret."
        />
      </p>

      <p>
        När du har bekräftat e-postmeddelandet måste du fortfarande ge ditt
        samtycke till att dina uppgifter används. Utan samtycke kan
        Helsingforsprofilen inte skapas och tjänsterna kan inte använda dina
        uppgifter.
      </p>

      <p>
        Efter att ha angett den 6-siffriga verifieringskoden, fyll i ditt namn,
        ange ditt lösenord och samtycka till att använda dina uppgifter.{' '}
      </p>

      <p>
        Lösenordet måste innehålla minst 12 tecken, stora och små bokstäver,
        nummer och specialtecken.
      </p>

      <p>
        <img
          width={215}
          height={406}
          src={image010}
          alt="När du skapar Helsingforsprofilen måste du fortfarande fylla i ditt namn och lösenord. &#10;Du måste också ge ditt samtycke till att dina uppgifter används för att skapa Helsingforsprofilen."
        />
      </p>

      <p>
        Nu har du Helsingforsprofilen. Det Helsingfors-ID du behöver för att
        autentisera dig till tjänsterna är denna kombination av e-postadress och
        lösenord.
      </p>

      <h2 id="_Kombinera_identifieringsmetoder">
        Kombinera identifieringsmetoder
      </h2>

      <p>
        Om du vill kan du kombinera olika autentiseringsmetoder i en enda
        Helsingforsprofil, så att du kan se och hantera alla dina data och
        tjänster på en gång. Detta kan göras genom att först skapa ett
        Helsingfors-ID med en e-postadress/lösenordskombination och sedan
        använda samma e-postadress för den första suomi.fi-inloggningen.
      </p>

      <p>
        Om din Helsingforsprofil skapades med en suomi.fi-autentisering kan du
        klicka på länken <i>Jag har glömt mitt lösenord</i>
        på inloggningsskärmen. För instruktioner om hur du gör detta, se
        avsnittet <a href="#_Glömt_lösenord">Glömt lösenord</a> nedan.
      </p>

      <h2 id="_Glömt_lösenord">Glömt lösenord</h2>

      <p>
        Om du inte kommer ihåg ditt lösenord kan du skapa ett nytt i
        inloggningsfönstret genom att klicka på länken{' '}
        <i>Jag har glömt mitt lösenord</i>. Du kan också ha &quot;glömt&quot;
        ditt lösenord eftersom du tidigare har loggat in i tjänsten via suomi.fi
        autentisering och då inte behövt ange ett lösenord.
      </p>

      <h2>
        <img
          width={340}
          height={499}
          src={image011}
          alt="I inloggningsfönstret klickar du på länken Jag har glömt mitt lösenord."
        />
      </h2>

      <p>
        <img
          width={321}
          height={335}
          src={image012}
          alt="Ange din e-postadress i rutan som visas för att få en länk till förnyat lösenord i din e-post."
        />
      </p>

      <p>
        <img
          width={284}
          height={505}
          src={image013}
          alt="Du kommer att informeras om att ett e-postmeddelande kommer att skickas till dig för att förnya ditt lösenord."
        />
      </p>

      <p>
        När du har angett din e-postadress kommer du att få en länk för att ange
        ett nytt lösenord i din e-post. Länken kommer att vara giltig i 30
        minuter.
      </p>

      <p>
        <img
          width={482}
          height={302}
          src={image014}
          alt="I det e-postmeddelande du får kommer det att finnas en länk för att ange ett nytt lösenord. Länken kommer att vara giltig i 30 minuter."
        />
      </p>

      <p>
        Lösenordet måste vara minst 12 tecken långt. Det måste innehålla både
        stora och små bokstäver, nummer och specialtecken.
      </p>

      <p>
        <img
          width={319}
          height={340}
          src={image015}
          alt="I fönstret för lösenordsändring måste du ange samma lösenord två gånger. Lösenordet måste vara minst 12 tecken långt. Lösenordet måste innehålla både stora och små bokstäver, nummer och specialtecken."
        />
      </p>

      <h2 id="_Problem_med_identifiering">Problem med identifiering</h2>

      <p>
        När du flyttar från en tjänst till en annan kan autentiseringen vara
        olika för de olika tjänsterna. Du loggade in på den första tjänsten med
        ditt Helsinki ID, dvs. en kombination av e-post och lösenord, men den
        andra tjänsten kräver att du identifierar dig med suomi.fi. I så fall
        får du ett meddelande om att autentiseringsmetoden inte är kompatibel.
        Du måste logga ut från den tidigare tjänsten för att autentisera dig i
        den nya tjänsten. Två olika autentiseringsmetoder kan inte vara öppna
        samtidigt.
      </p>

      <p>
        <img
          width={388}
          height={370}
          src={image016}
          alt="En inkompatibel inloggningsmetod innebär för exempel att du har loggat in på en tjänst med en kombination av e-post och lösenord och går vidare till nästa tjänst, som kräver en suomi.fi-autentisering. I detta fall måste du logga ut från den första tjänsten för att kunna autentisera dig till den nya tjänsten."
        />
      </p>

      <p>
        <img
          width={433}
          height={345}
          src={image017}
          alt="Bekräfta din utloggning från en tidigare tjänst."
        />
      </p>

      <h2 id="_Visa_och_redigera">Visa och redigera dina egna uppgifter</h2>

      <p>
        Genom att logga in på din Helsingforsprofil på
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a> kan du se
        och redigera dina uppgifter och hur de används av tjänsterna:
      </p>

      <ul>
        <li>Du kan lägga till ett telefonnummer.</li>

        <li>Du kan ändra din e-postadress.</li>

        <li>Du kan lägga till din adressinformation.</li>
      </ul>
      <p>
        De officiella uppgifterna läggs till i din profil och syns endast när du
        autentiserar dig med suomi.fi. Uppdateringen av uppgifterna görs i
        Befolkningsregistercentralens tjänst.
      </p>

      <p>
        Om du uppdaterar dina namnuppgifter i din Helsingforsprofil, kommer de
        officiella uppgifterna att uppdateras nästa gång du autentiserar dig in
        med suomi.fi.
      </p>

      <p>
        <img
          width={482}
          height={320}
          src={image018}
          alt="I avsnittet Min information i Helsingforsprofilen kommer officiella uppgifter direkt från Befolkningsregistercentralen och uppdateras också där."
        />
      </p>

      <p>
        <img
          width={482}
          height={288}
          src={image019}
          alt="I din Helsingforsprofil kan du uppdatera din basuppgifter i avsnittet Min information."
        />
      </p>

      <p>
        Du kan lägga till eller ändra information som du själv har lagt in genom
        att klicka på knappen Lägg till, eller på knappen Redigera om
        informationen redan finns. Tryck på knappen Spara för att spara
        uppgifterna i databasen.
      </p>

      <p>
        <img
          width={482}
          height={348}
          src={image020}
          alt="Du kan lägga till och redigera dina andra adressuppgifter, ditt telefonnummer och din e-postadress."
        />
      </p>

      <p>
        I Helsingfors-profilen bestämmer avsnittet om tjänstens kontakspråk på
        vilket språk t.ex. e-post från tjänsten ska skickas.
      </p>

      <p>
        <img
          width={482}
          height={118}
          src={image021}
          alt="Tjänstens kontakspråk avgör på vilket språk du tar emot meddelanden från tjänsten."
        />
      </p>

      <p>
        Du kan också se hur du är autentiserad dig på din Helsingforsprofil.
      </p>

      <p>
        <img
          width={482}
          height={78}
          src={image022}
          alt="På avsnittet Min information i din Helsingforsprofil anger autentiseringsmetoden hur du är inloggad i tjänsten, dvs. suomi.fi-autentisering eller en kombination av e-post och lösenord, dvs. Helsingfors-ID."
        />
      </p>

      <h2 id="_Olika_tjänsters_bearbetning">
        Olika tjänsters bearbetning av dina uppgifter
      </h2>

      <p>
        Tjänsterna kommer att använda de uppgifter som hanteras av
        Helsingforsprofilen enligt vad som anges. Första gången du identifierar
        dig i en tjänst kan du se vilka uppgifter tjänsten använder.
      </p>

      <p>
        <img
          width={433}
          height={446}
          src={image023}
          alt="När du identifierar dig för en ny tjänst kommer du att bli ombedd att godkänna den användning av dina uppgifter som tjänsten kräver. &#10;Du kan senare återvända till denna information på avsnittet Dina tjänster i din Helsingforsprofil."
        />
      </p>

      <p>
        I din Helsingforsprofil kan du kontrollera denna information senare och,
        om du vill, radera dina uppgifter från tjänsten. Det är inte möjligt att
        radera dina uppgifter om du befinner dig mitt i serviceprocessen. Det är
        också tillrådligt att{' '}
        <a href="#_Ladda_ner_din">ladda ner dina egna information</a> innan du
        raderar dem.
        <img
          width={482}
          height={469}
          src={image024}
          alt="I avsnittet Dina tjänster i din Helsingforsprofil kan du se alla tjänster som du är autentiserad dig på och vilka data de använder. &#10;Du kan också radera dina uppgifter från enskilda tjänster."
        />
      </p>

      <h2 id="_Ladda_ner_din">Ladda ner din information</h2>

      <p>
        Du kan ladda ner data som du har lagrat i olika tjänster som en enda
        json-fil. Mer information om{' '}
        <a href="https://sv.wikipedia.org/wiki/JSON">
          filformatet json finns på Wikipedia (länken öppnas i ett nytt fönster)
        </a>
        .
      </p>

      <p>
        Om du har kombinerat din suomi.fi-autentisering och inloggning med
        e-postadress + lösenord i samma Helsingforsprofil, måste
        datanerladdningen göras med suomi.fi-autentiseringen.
      </p>

      <p>
        <img
          width={482}
          height={106}
          src={image025}
          alt="I avsnittet Min information i din Helsingforsprofil kan du ladda ner din information för alla tjänster som en json-fil."
        />
      </p>

      <h2 id="_Radera_dina_uppgifter">
        Radera dina uppgifter från en enda tjänst eller från hela din
        Helsingforsprofil
      </h2>

      <p>
        Du kan radera dina uppgifter antingen för enskilda tjänster eller för
        hela din profil. När du väljer den tjänst som du vill radera på
        avsnittet Dina tjänster, visas ett popup-fönster som bekräftar
        raderingen. Vid radering kommer alla dina uppgifter från tjänsten att
        raderas eller anonymiseras om tjänsten till exempel är skyldig enligt
        lag att behålla dem.{' '}
      </p>

      <p>
        Om du har kombinerat din suomi.fi-autentisering och inloggning med
        e-postadress och lösenord i samma Helsingforsprofil, måste du radera
        tjänsten medan du är autentiserad dig med suomi.fi.
      </p>

      <p>
        Du kommer dock inte att ha tillgång till uppgifterna efter raderingen
        och de kommer inte att kunna kopplas till dig.
      </p>

      <p>
        <img
          width={482}
          height={238}
          src={image026}
          alt="Du kan radera dina uppgifter i din Helsingforsprofil för en enskild tjänst i avsnittet Dina tjänster."
        />
      </p>

      <p>
        <img
          width={482}
          height={215}
          src={image027}
          alt='När du klickar på knappen "Ta bort dina uppgifter från denna tjänst" får du ett popup-bekräftelsemeddelande på skärmen för att förhindra oavsiktlig radering av dina uppgifter.'
        />
      </p>

      <p>
        <img
          width={448}
          height={225}
          src={image028}
          alt="Du kommer att få ett bekräftelsemeddelande om att uppgifterna har tagits bort från tjänsten."
        />
      </p>

      <p>
        Om du vill radera hela din Helsingforsprofil kan du göra det genom att
        trycka på knappen <i>Radera min information</i>. Du kommer då att se ett
        popup-fönster där du ombeds bekräfta att du vill radera din information.
        När du har bekräftat begäran raderas alla uppgifter från profilen och
        från alla tjänster, om ingen tjänst är på gång.
      </p>

      <p>
        Vissa lagstadgade tjänster kan kräva att uppgifter sparas under en
        begränsad eller permanent period. Beroende på transaktionen och tjänsten
        kan uppgifterna i vissa fall anonymiseras. Om en lagstadgad tjänst
        kräver att uppgifter sparas, kan profilen eller tjänstens tillgång till
        uppgifterna inte raderas.
      </p>

      <p>
        Om du har kombinerat din suomi.fi-autentisering och inloggning med
        e-postadress och lösenord i samma Helsingforsprofil, måste du radera
        profilen medan du är autentiserad dig med suomi.fi.
      </p>

      <p>
        Efter att du har raderat din Helsingforsprofil kan du alltid skapa en ny
        profil vid behov, men alla tidigare uppgifter försvinner.
      </p>

      <p>
        <img
          width={482}
          height={140}
          src={image029}
          alt="I avsnittet Min information i din Helsingforsprofil finns knappen Radera min information, med vilken du kan radera hela din Helsingforsprofil och den information som du har använt i olika tjänster."
        />
      </p>

      <p>
        <img
          width={357}
          height={214}
          src={image030}
          alt="Ett bekräftelsemeddelande visas också i ett popup-fönster för att förhindra oavsiktlig radering av data."
        />
      </p>
    </Fragment>
  );
}

export default UserGuideSv;
