import React, { Fragment, ReactElement } from 'react';
import { Link } from 'hds-react';

import FocusableH1 from '../common/focusableH1/FocusableH1';

function AboutPageFi(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Tietoa Helsinki-profiilista</FocusableH1>
      <p>
        Helsinki-profiili on kaupunkilaisten asiointitunnus sekä henkilö- ja yhteystietojen säilytyspalvelu. Se kokoaa
        yhteen paikkaan asiakkaan henkilötiedot ja yhteydet eri kaupungin palveluihin.
      </p>
      <p>Helsinki-profiiliin ja sen avulla eri digitaalisiin sovelluksiin tunnistautuminen tapahtuu:</p>
      <ul>
        <li>vahvasti Suomi.fi-tunnistautumista käyttäen</li>
        <li>kevyesti Helsinki-tunnuksen sähköpostiosoite-salasana-yhdistelmällä.</li>
      </ul>
      <p>
        Helsinki-profiilin ja siihen tallennettujen tietojen käyttö perustuu kevyen tunnistautumisen osalta pääosin
        asiakkaan antamaan suostumukseen sekä vahvan tunnistautumisen osalta lakisääteiseen perusteeseen.
      </p>
      <p>
        Helsinki-profiili tukee kertakirjautumis- eli SSO-periaatetta (single sign-on). Näin yhteen palveluun jo
        kirjautunut asiakas voi siirtyä toiseen kirjautumatta uudelleen ja samat yhteystiedot ovat kummankin palvelun
        käytettävissä. Helsinki-profiilia hyödyntävä digipalvelu määrittää asiakkaalta vaaditun tunnistautumistason:
        kevyen tai vahvan.
      </p>
      <h2>Vahva tunnistautuminen</h2>
      <p>
        Mikäli palvelun käyttäminen vaatii virallisia henkilötietoja, asiakkaalle tarjotaan vahva tunnistautuminen
        profiiliin keskitetyn Suomi.fi-tunnistautumispalvelun kautta, jotta viralliset henkilötiedot saadaan välitettyä
        palvelulle.
      </p>
      <p>
        Virallisina henkilötietoina Helsinki-profiiliin tallennetaan asiakkaasta Suomi.fi:n kautta saadut
        väestötietojärjestelmän keskilaajat perustiedot, joihin sisältyy
      </p>
      <ul>
        <li>virallinen etu- ja sukunimi</li>
        <li>henkilötunnus</li>
        <li>kotiosoite</li>
        <li>kotikunta</li>
      </ul>
      <p>
        Viralliset tiedot esitetään myös Helsinki-profiilissa vahvasti tunnistautuneelle käyttäjälle. Asiakas voi
        muuttaa tietojaan virallisen väestötietojärjestelmän henkilötietojen muutosprosessin kautta. Tämä ei siis ole
        mahdollista Helsinki-profiilissa.
      </p>
      <p>
        Viralliset henkilötiedot päivitetään Suomen väestötietojärjestelmästä Helsinki-profiiliin jokaisen
        Suomi.fi-kirjautumisen yhteydessä.
      </p>
      <p>
        Asiakas antaa suostumuksensa eri digitaalisille palveluille, jotta nämä voivat käyttää profiilista löytyviä
        tietoja. Sovellukset voivat pyytää niitä esimerkiksi palveluiden tai tuotteiden myöntöperusteeksi.
      </p>
      <p>
        Vahvan tunnistautumisen käytölle pitää olla aina lakisääteiset perusteet, eli palvelua käytettäessä sitä ei
        voida kaikissa tapauksissa sitä ei voida henkilöltä edellyttää. Kevyt tunnistautuminen voidaan kuitenkin tarjota
        vapaaehtoisena tunnistautumistapana.
      </p>
      <h2>Kevyt tunnistautuminen</h2>
      <p>
        Tunnistautumisessa kevyt tarkoittaa sitä, että henkilötietoja ei ole mitään virallista tapaa hyödyntäen
        vahvistettu. Kevyen tunnistautumisen keinona profiilissa on käyttäjän varmennettu sähköpostiosoite sekä
        salasana.
      </p>
      <p>
        Tätä tunnistautumistapaa voidaan käyttää silloin, kun asioinnissa ei vaadita virallisia henkilötietoja.
        Esimerkiksi yhteystiedot ovat käyttäjän itsensä ilmoittamia, ei virallisista järjestelmistä haettuja. Tiedot
        ovat asiakkaan itse muokattavissa Helsinki-profiilissa. Nämä tiedot ovat käytettävissä aina myös ilman vahvaa
        tunnistautumista.
      </p>
      <p>Kevyisiin tietoihin kuuluvat (pakolliset tiedot on merkitty *)</p>
      <ul>
        <li>asiakkaan itse ilmoittamat nimet *</li>
        <li>sähköpostiosoite *</li>
        <li>puhelinnumero ja</li>
        <li>osoitetiedot</li>
      </ul>
      <p>Sähköpostiosoite varmistetaan vahvistusviestillä.</p>
      <p>
        Käyttäjältä pyydetään aina uuteen palveluun tullessa suostumus Helsinki-profiilin tietojen käyttöön.
        Suostumukset on esitetty Helsinki-profiilin käyttöliittymän &quot;Käyttämäsi palvelut&quot;-kohdassa. Käyttäjä
        voi poistaa antamansa suostumuksen milloin tahansa.
      </p>
      <p>
        Käyttäjä voi muokata itse syöttämiään henkilötietoja profiilissa. Lisäksi hän voi hallinnoida omien tietojensa
        käyttöä eri palvelujen välillä. Hän voi ladata tietonsa eri palveluista tai poistaa tietonsa yhdestä palvelusta
        tai kaikista esimerkiksi poistamalla koko profiilin.
      </p>
      <h2>Tietosuoja</h2>
      <p>
        Tiedot tallennetaan Helsinki-profiilin tietokantaan, josta ne välitetään eri palvelujen käyttöön asiakkaan
        suostumuksen perusteella. Helsinki-profiilissa admin-käyttäjät näkevät ja voivat muokata käyttäjän itse
        ilmoittamia tietoja. Tällaisia käyttäjiä on 3–7 henkilöä.
      </p>
      <p>
        Lisäksi Helsinki-profiilin kehittämisen sekä mahdollisten ongelmatilanteiden osalta kehitystiimin jäsenillä on
        pääsy tietokantaan.
      </p>
      <p>Kaikki toiminta lokitetaan.</p>
      <p>
        Henkilötiedot, mukaan lukien henkilötunnus, voivat siirtyä Helsinki-profiilin rajapinnasta asiointipalveluihin,
        jos kyseinen palvelu tätä tietoa tarvitsee. Tämä tapahtuu käyttäjän suostumuksella, ja näiden tietojen käsittely
        esitetään kyseisen palvelun tietosuojaselosteessa ja käyttöehdoissa.
      </p>
      <p>
        Helsinki-profiili sijaitsee Helsingin kaupungin Azure-pilvipalvelussa, ja palvelimet sijaitsevat Irlannissa.
        Niitä ei peilata muihin Azure-lokaatioihin. Varmuuskopiot sijaitsevat Azuressa samalla alueella kuin itse
        palvelimetkin. Henkilötietoja ei käsitellä muualla kuin Helsingissä.
      </p>
      <p>
        Kaikki kaupungin pilvipalvelussa käsiteltävät henkilötiedot on suojattu asianmukaisin suojausavaimin
        (Microsoftin EU Data Boundary). Tietoja säilytetään viisi vuotta tapahtumasta kunnallisten asiakirjojen
        säilytysajan mukaisesti.
      </p>
      <p>
        Helsinki-profiilin tietojen käsittely on kuvattu{' '}
        <Link
          // eslint-disable-next-line max-len
          href='https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Keha/Sahkoisten%20asiointipalveluiden%20rekisteri.pdf'
          external
          openInNewTab
        >
          Helsingin kaupungin sähköisten asiointipalvelujen tietosuojaselosteessa.
        </Link>
      </p>
      <p>
        Lisätietoa{' '}
        <Link
          // eslint-disable-next-line max-len
          href='https://www.hel.fi/fi/paatoksenteko-ja-hallinto/tietoa-helsingista/tietosuoja-ja-tiedonhallinta/tietosuoja/rekisteroidyn-oikeudet-ja-niiden-toteuttaminen'
          external
          openInNewTab
        >
          EU:n yleisen tietosuoja-asetuksen mukaisista oikeuksista
        </Link>{' '}
        Helsingin kaupungin verkkopalveluissa.
      </p>
      <p>
        Palvelussa hyödynnetään myös kävijäseurantaan kaupungin Matomo-ratkaisua, jonka keräämät tiedot on kuvattu
        Evästeet-kohdassa.
      </p>
      <h2>Evästeet</h2>
      <p>
        Eväste (cookie) on tiedosto, jonka selain tallentaa käyttäjän päätelaitteelle. Evästeitä käytetään tarjoamaan
        palvelun käyttöä helpottavia ominaisuuksia ja niiden avulla voidaan myös kerätä tietoa käyttäjistä palvelun
        parantamiseksi. Evästeiden avulla tarjoamme sujuvammin käytettävän ja toimivan verkkosivuston, joka vastaa
        entistä paremmin käyttäjien tarpeita.
      </p>
      <p>
        Käyttäjäseurannan osalta evästeet sisältävät nimettömän, yksilöllisen tunnisteen, jonka avulla saamme tietoa
        sivustollamme vierailevista eri käyttäjistä, muun muassa heidän selaimistaan ja päätelaitteistaan. Käyttäjän
        yksilöiviä tietoja ei niistä näy sivuston ylläpitäjille. Evästeiden kautta saadaan tietoa siitä, miten
        selaimella liikutaan sivustoillamme ja minkälaisia sivuja katsotaan.
      </p>
      <p>Käyttäjällä on mahdollisuus vaikuttaa evästeiden käyttöön evästekyselyn kautta.</p>
      <p>
        Palvelun kävijätilastointia varten Matomo-ratkaisun keräämät tiedot anonymisoidaan, joten niitä ei voida liittää
        yksittäiseen henkilöön. Tällaisia tietoja ovat:
      </p>
      <ul>
        <li>IP-osoite</li>
        <li>Kaupunki-tasolla maantieteellinen sijainti</li>
        <li>Käytetty laitemalli ja käyttöjärjestelmä</li>
        <li>Käytetty selain</li>
        <li>Ajankohta</li>
        <li>Palveluun saapumis- ja palvelusta lähtösivut</li>
        <li>Palvelussa vieraillut sivut ja toiminta sivustolla</li>
      </ul>
    </Fragment>
  );
}

export default AboutPageFi;
