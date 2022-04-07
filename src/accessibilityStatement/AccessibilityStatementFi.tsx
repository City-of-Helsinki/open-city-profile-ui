import React, { Fragment, ReactElement } from 'react';

import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function AccessibilityStatementFi(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Saavutettavuusseloste</FocusableH1>
      <p>
        Tämä saavutettavuusseloste koskee Helsingin kaupungin
        Helsinki-profiili-sivustoa. Sivuston osoite on https://profiili.hel.fi.
      </p>

      <h2>Kaupungin tavoite</h2>
      <p>
        Digitaalisten palveluiden saavutettavuudessa Helsingin tavoitteena on
        pyrkiä vähintään WCAG-ohjeiston mukaiseen AA- tai sitä parempaan tasoon,
        mikäli se on kohtuudella mahdollista.
      </p>

      <h2>Vaatimustenmukaisuustilanne</h2>
      <p>
        Tämä verkkosivusto täyttää lain asettamat saavutettavuusvaatimukset
        kaikilta osin.
      </p>

      <h2>Saavutettavuusselosteen laatiminen</h2>
      <p>Tämä seloste on laadittu 5.4.2022.</p>

      <h3>Saavutettavuuden arviointi</h3>
      <p>
        Saavutettavuuden arvioinnissa on noudatettu Helsingin kaupungin
        työohjetta ja menetelmiä, jotka pyrkivät varmistamaan sivuston
        saavutettavuuden kaikissa työvaiheissa.
      </p>
      <p>
        Saavutettavuus on tarkistettu ulkopuolisen asiantuntijan suorittamana
        auditointina sekä itsearviona.
      </p>
      <p>
        Saavutettavuus on tarkistettu käyttäen ohjelmallista
        saavutettavuustarkistusta sekä sivuston ja sisällön manuaalista
        tarkistusta. Ohjelmallinen tarkistus on suoritettu käyttäen Siteimproven
        saavutettavuuden automaattista testaustyökalua ja selainlaajennusta.
      </p>
      <p>Ulkopuolisen asiantuntija-auditoinnin on suorittanut Siteimprove.</p>

      <h3>Saavutettavuusselosteen päivittäminen</h3>
      <p>
        Sivuston saavutettavuudesta huolehditaan jatkuvalla valvonnalla
        tekniikan tai sisällön muuttuessa sekä määräajoin suoritettavalla
        tarkistuksella. Tätä selostetta päivitetään sivuston muutosten ja
        saavutettavuuden tarkistusten yhteydessä.
      </p>

      <h2>Palaute ja yhteystiedot</h2>
      <p>
        Kaupunginkanslia
        <br />
        Helsinki
      </p>

      <h3>Ilmoittaminen ei-saavutettavasta sisällöstä</h3>
      <p>
        Mikäli käyttäjä kokee, etteivät saavutettavuuden vaatimukset kuitenkaan
        täyty, voi tästä tehdä ilmoituksen sähköpostilla{' '}
        <a href="mailto:helsinki.palaute@hel.fi">helsinki.palaute@hel.fi</a> tai
        palautelomakkeella{' '}
        <Link href="https://www.hel.fi/palaute" external openInNewTab>
          www.hel.fi/palaute
        </Link>
        .
      </p>

      <h3>Tietojen pyytäminen saavutettavassa muodossa</h3>
      <p>
        Mikäli käyttäjä ei koe saavansa sivuston sisältöä saavutettavassa
        muodossa, voi käyttäjä pyytää näitä tietoja sähköpostilla{' '}
        <a href="mailto:helsinki.palaute@hel.fi">helsinki.palaute@hel.fi</a> tai
        palautelomakkeella{' '}
        <Link href="https://www.hel.fi/palaute" external openInNewTab>
          www.hel.fi/palaute
        </Link>
        . Tiedusteluun pyritään vastaamaan kohtuullisessa ajassa.
      </p>

      <h2>Saavutettavuuden oikeussuoja, Täytäntöönpanomenettely</h2>
      <p>
        Mikäli henkilö kokee, ettei hänen ilmoitukseensa tai tiedusteluunsa ole
        vastattu tai vastaus ei ole tyydyttävä, voi asiasta tehdä ilmoituksen
        Etelä-Suomen aluehallintovirastoon. Etelä-Suomen aluehallintoviraston
        sivulla kerrotaan tarkasti, miten asia käsitellään.
      </p>
      <p>
        <strong>Etelä-Suomen aluehallintovirasto</strong>
        <br />
        <br />
        Saavutettavuuden valvonnan yksikkö
        <br />
        <Link
          href="https://www.saavutettavuusvaatimukset.fi"
          external
          openInNewTab
        >
          www.saavutettavuusvaatimukset.fi
        </Link>
        <br />
        <a href="mailto:saavutettavuus@avi.fi">saavutettavuus@avi.fi</a>
        <br />
        Puhelinvaihde: <a href="tel:0295 016 000">0295 016 000</a>
        <br />
        Avoinna: ma-pe klo 8.00-16.15
      </p>

      <h2>Helsingin kaupunki ja saavutettavuus</h2>
      <p>
        Kaupunki edistää digitaalisten palveluiden saavutettavuutta
        yhdenmukaistamalla julkaisutyötä ja järjestämällä saavutettavuuteen
        keskittyvää koulutusta henkilökunnalleen.
      </p>
      <p>
        Sivustojen saavutettavuuden tasoa seurataan jatkuvasti sivustoja
        ylläpidettäessä. Havaittuihin puutteisiin reagoidaan välittömästi.
        Tarvittavat muutokset pyritään suorittamaan mahdollisimman nopeasti.
      </p>

      <h3>Vammaiset ja avustavien teknologioiden käyttäjät</h3>
      <p>
        Kaupunki tarjoaa neuvontaa ja tukea vammaisille ja avustavien
        teknologioiden käyttäjille. Tukea on saatavilla kaupungin sivuilla
        ilmoitetuilta neuvontasivuilta sekä puhelinneuvonnasta.
      </p>

      <h2>Saavutettavuusselosteen hyväksyntä</h2>
      <p>Tämän selosteen on hyväksynyt 5.4.2022</p>
      <p>
        Kaupunginkanslia
        <br />
        Helsinki
      </p>
    </Fragment>
  );
}

export default AccessibilityStatementFi;
