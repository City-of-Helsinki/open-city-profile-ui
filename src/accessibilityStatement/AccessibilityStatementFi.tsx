import React, { Fragment, ReactElement } from 'react';

import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function AccessibilityStatementFi(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Helsinki-profiilin saavutettavuusseloste</FocusableH1>
      <p>
        Tämä saavutettavuusseloste koskee Helsingin kaupungin Helsinki-profiili-verkkopalvelua
        (https://profiili.hel.fi). Verkkopalvelusta vastaa
        Helsingin kaupunki. Tässä selosteessa kerrotaan, kuinka saavutettava
        verkkopalvelu on ja miten voit antaa meille palautetta
        saavutettavuudesta.
      </p>
      <h2>Kuinka saavutettava tämä verkkopalvelu on?</h2>
      <p>
        Digitaalisten palveluiden tarjoamista koskevan lain mukaan julkisten
        verkkosivustojen on oltava saavutettavia, eli kaikilla tulee olla
        tasavertaiset mahdollisuudet käyttää niitä.
      </p>
      <p>
        Saavutettavuusauditoinnissa tehdyt huomiot on korjattu, joten tämä
        verkkopalvelu täyttää kaikilta osin lain vaatimat
        saavutettavuuskriteerit (WCAG-kriteeristö 2.1, A- ja AA-taso).
      </p>
      <h3>Saavutettavuuden arviointi</h3>
      <p>
        Saavutettavuuden arvioinnissa on noudatettu Helsingin kaupungin
        työohjetta ja menetelmiä, jotka pyrkivät varmistamaan palvelun
        saavutettavuuden kaikissa työvaiheissa.
      </p>
      <p>
        Saavutettavuus on tarkistettu ulkopuolisen asiantuntijan suorittamana
        arviointina. Saavutettavuus on tarkistettu käyttäen ohjelmallista
        saavutettavuustarkistusta sekä verkkopalvelun ja sisällön manuaalista
        tarkistusta.
      </p>
      <p>
        Saavutettavuusauditoinnissa havaitut epäkohdat on korjattu 21.05.2024
        mennessä.
      </p>
      <p>Ulkopuolisen asiantuntija-auditoinnin on suorittanut Unicus Oy.</p>
      <h2>Huomasitko puutteita saavutettavuudessa?</h2>
      <p>
        Pyrimme jatkuvasti parantamaan verkkopalvelun saavutettavuutta. Ota
        meihin yhteyttä, jos löydät saavutettavuuspuutteita, joita ei ole
        kuvattu tällä sivulla, tai tarvitsemasi aineisto ei ole saavutettavaa.
        <Link href="https://palautteet.hel.fi/fi" external openInNewTab>
          Anna palautetta palautelomakkeella.
        </Link>
      </p>
      <h2>Saavutettavuuden valvonta</h2>
      <p>
        Etelä-Suomen aluehallintovirasto valvoo saavutettavuusvaatimusten
        toteutumista. Jos et ole tyytyväinen saamaasi vastaukseen tai et saa
        vastausta lainkaan kahden viikon aikana, voit tehdä ilmoituksen
        Etelä-Suomen aluehallintovirastoon. Etelä-Suomen aluehallintoviraston
        sivulla kerrotaan tarkasti, miten ilmoituksen voi tehdä ja miten asia
        käsitellään.
      </p>
      <p>
        Etelä-Suomen aluehallintovirasto <br />
        Saavutettavuuden valvonnan yksikkö
        <br />
        Sähköposti:{' '}
        <a href="mailto:saavutettavuus@avi.fi">saavutettavuus@avi.fi</a> <br />
        Puhelinnumero vaihde: <a href="tel:0295 016 000">0295 016 000</a>
      </p>
      <Link
        href="https://www.saavutettavuusvaatimukset.fi"
        external
        openInNewTab
      >
        www.saavutettavuusvaatimukset.fi
      </Link>
      <h2>Saavutettavuusselosteen tiedot</h2>
      <p>Verkkopalvelu on julkaistu 30.11.2022.</p>{' '}
      <p>Tämä seloste on laadittu 20.03.2024. </p>
      <p>Seloste on viimeksi päivitetty 21.05.2024.</p>{' '}
      <p>
        <Link
          href="https://www.finlex.fi/fi/laki/alkup/2019/20190306"
          external
          openInNewTab
        >
          Laki digitaalisten palvelujen tarjoamisesta (306/2019)
        </Link>
      </p>
    </Fragment>
  );
}

export default AccessibilityStatementFi;
