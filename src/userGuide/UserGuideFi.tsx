/* eslint-disable max-len */
import React, { Fragment, ReactElement } from 'react';
import { IconDownload, Link } from 'hds-react';

import styles from './UserGuide.module.css';
import UserGuideAccordion from './UserGuideAccordion';
import UserGuideImage from './UserGuideImage';
import UserGuideNav from './nav/Nav';
import image001 from './assets/01-sisaankirjautuminen.png';
import image002 from './assets/02-sisaankirjautuminen-tunnistamo.png';
import image003 from './assets/03-vahvan-valinta.png';
import image004 from './assets/04-vahvat-tiedot.png';
import image005 from './assets/05-10-sahkopostiosoite.png';
import image006 from './assets/06-11-sahkopostin-vahvistuskoodi.png';
import image007 from './assets/07-12-sahkopostin-vahvistus.png';
import image008 from './assets/08-profiilin-luominen.png';
import image009 from './assets/09-helsinki-tunnus-luonti.png';
import image010 from './assets/13-helsinki-tunnus-teko.png';
import image011 from './assets/14-salasanan-unohdus.png';
import image012 from './assets/15-sahkoposti-salasanalle.png';
import image013 from './assets/16-salasanan-vaihtopyynto.png';
import image014 from './assets/17-salasanan-vaihtoviesti.png';
import image015 from './assets/18-uusi-salasana.png';
import image016 from './assets/19-yhteensopimaton-kirjautuminen.png';
import image017 from './assets/20-kirjautumislogout.png';
import image018 from './assets/21-omat-tiedot.png';
import image019 from './assets/22-omat-nimitiedot.png';
import image023 from './assets/23-omat-yhteystiedot.png';
import image024 from './assets/24-olemassa-olevan-profiilin-kirjautuminen.png';
import image025 from './assets/25-kayttamasi-palvelut.png';
import image026 from './assets/26-tietojen-lataus.png';
import image027 from './assets/27-tietojen-poisto-palvelusta.png';
import image028 from './assets/28-tietojen-poisto-palvelusta-pop-up.png';
import image029 from './assets/29-tietojen-poisto.png';
import image030 from './assets/30-tietojen-poisto-popup.png';
import FocusableH1 from '../common/focusableH1/FocusableH1';

const tableOfContents = [
  { title: 'Helsinki-profiilin luonti', href: '#_Helsinki_profiilin_luonti' },
  { title: 'Kirjautuminen', href: '#_Kirjautuminen' },
  {
    title: 'Omien tietojen katselu ja muokkaaminen',
    href: '#_Omien_tietojen_katselu',
  },
  { title: 'Tietojen poisto', href: '#_Tietojen_poisto' },
];

const altText05 =
  'Sähköpostiosoite toimii tunnuksenasi Helsingin kaupungin palveluihin. Käyttämällä samaa sähköpostiosoitetta sekä suomi.fi-tunnistautumisessa että Helsinki-tunnuksella, saat yhden Helsinki-profiilin. Yhdistämistä ei voi purkaa myöhemmin.';

function UserGuideFi(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Helsinki-profiilin ohje</FocusableH1>
      <p>
        Helsinki-profiili on kaupungin digitaalisia asiointipalveluja käyttävän
        kaupunkilaisen asiakasprofiili. Se on ensisijainen tunnistautumistapa
        kaupungin digitaalisiin palveluihin. Helsinki-profiili kokoaa yhteen
        paikkaan asiakkaan henkilö- ja yhteystiedot sekä yhteydet eri kaupungin
        palveluihin. Profiilissa käyttäjä voi hallinnoida omia tietojaan ja
        niiden näkyvyyttä eri palvelussa.
      </p>
      <Link
        className={styles['download-link']}
        href="/Helsinki-profiili-ohjeet.pdf"
        download="Helsinki-profiili-ohjeet.pdf"
        iconLeft={<IconDownload />}
        useButtonStyles
      >
        Helsinki-profiilin ohje (.pdf)
      </Link>

      <UserGuideNav items={tableOfContents} heading="Tällä sivulla" />

      <h2 id="_Helsinki_profiilin_luonti">Helsinki-profiilin luonti</h2>
      <p>
        Helsinki-profiilia käytetään kirjautumalla Helsingin kaupungin
        asiointipalveluihin. Ensimmäisellä kirjautumiskerralla sinua pyydetään
        luomaan Helsinki-profiili ja antamaan suostumus palvelun tarvitsemien
        tietojen käyttöön.
      </p>
      <p>
        Voit myös luoda Helsinki-profiilin osoitteessa{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>.
      </p>
      <p>
        Helsinki-profiilin voit luoda käyttäen suomi.fi-tunnistautumista tai
        sähköpostia ja salasanaa. Helsingin kaupungin digitaalisiin palveluihin
        voi myös kirjautua Google- tai Yle -tunnuksilla, jotka poistuvat
        käytöstä vuoden 2024 aikana.
      </p>
      <UserGuideAccordion
        id="_Suomi.fi-tunnistautuminen"
        heading="Suomi.fi-tunnistautuminen"
      >
        <h4>Tunnistautumisen valinta</h4>
        <p>
          Asiointipalvelussa Kirjaudu-linkin painamisen jälkeen käyttäjä saa
          erilaisia kirjautumisvaihtoja tarjoavan näkymän, jossa valitaan
          suomi.fi-tunnistautuminen. Kirjautumisvaihtoehtojen näkymä vaihtelee
          eri asiointipalveluissa.
        </p>

        <p>
          <UserGuideImage
            src={image001}
            alt="Tunnistautumisikkunassa valitaan suomi.fi-tunnistautuminen."
          />
        </p>

        <p>
          <UserGuideImage
            src={image002}
            alt="Tunnistautumistavaksi valitaan suomi.fi-tunnistautuminen."
          />
        </p>

        <h4>Tunnistautuminen suomi.fi-palvelussa</h4>

        <p>
          Suomi.fi-tunnistautumisen valinnan jälkeen käyttäjä saa ruudulleen
          erilaisia tunnistautumistapoja. Vaihtoehdot ovat samat kuin muissakin
          julkishallinnon vahvaa tunnistautumista tarjoavissa palveluissa.
        </p>

        <p>
          Tunnistautumisen jälkeen tarkista, että käytettävät tiedot ovat
          oikein. Mikäli havaitset tiedoissa virheitä, ne tulee korjata
          väestörekisterikeskuksen palvelussa.
        </p>

        <p>
          <UserGuideImage
            src={image003}
            alt="Valitse oma pankkisi tai mobiilivarmenne suomi.fi-tunnistautumisvaihtoehtona."
          />
        </p>

        <p>
          <UserGuideImage
            src={image004}
            alt="Tarkista, että tietosi ovat oikein siirtyessäsi, kun siirryt takaisin Helsingin kaupungin palveluun."
          />
        </p>

        <h4>Sähköpostiosoitteen vahvistus</h4>
        <p>
          Tunnistautumisen jälkeen sinulta kysytään sähköpostiosoite.
          Sähköpostiosoitteeseen lähetetään vahvistusviesti osoitteen aitouden
          varmistamiseksi.
        </p>

        <p>
          Jos olet jo aiemmin luonut Helsinki-profiilin sähköpostiosoitteella ja
          salasanalla, voit käyttää samaa sähköpostiosoitetta. Tällöin eri
          tunnistautumistavat yhdistyvät, ja näet jatkossa kaikkien käyttämiesi
          palvelujen tiedot kerralla.
          <b> Huomaa kuitenkin, ettei yhdistämistä voi perua myöhemmin.</b>
        </p>

        <p>
          Sähköpostin vahvistamiseksi saat 6-numeroisen koodin antamaasi
          sähköpostiosoitteeseen. Jos viesti ei tule sähköpostiisi lähes
          välittömästi, tarkista roskaposti-kansiosi.
        </p>

        <p>
          <b>
            Älä sulje Helsinki-profiilin selainikkunaa, kun haet
            vahvistusviestin sähköpostistasi. Muuten järjestelmä olettaa sinun
            keskeyttäneen tunnistautumisprosessin.
          </b>
        </p>

        <p>
          <UserGuideImage src={image005} alt={altText05} />
        </p>

        <p>
          <UserGuideImage
            src={image006}
            alt="Sähköpostiviestissä on 6-numeroinen vahvistuskoodi, jolla varmennetaan, että sähköpostiosoite on aito."
          />
        </p>

        <p>
          <UserGuideImage
            src={image007}
            alt="Sähköpostin 6-numeroinen luku pitää kirjata selainikkunan vahvistuskoodi-kenttään."
          />
        </p>

        <h4>Helsinki-profiilin luonti</h4>

        <p>
          Sähköpostin vahvistamisen jälkeen sinun pitää vielä antaa suostumus
          tietojesi käyttöön. Ilman suostumusta Helsinki-profiilia ei voida
          luoda, eivätkä palvelut voi käyttää tietojasi.
        </p>

        <p>
          Tämän jälkeen sinulle syntyy Helsinki-profiili, ja
          suomi.fi-tunnistautumisen tiedot tallentuvat profiiliin. Eri
          asiointipalvelut hyödyntävät tietojasi eri tavalla, mutta ne kerrotaan
          aina ensimmäisellä kirjautumiskerralla. Tiedot löytyvät myös aina
          Helsinki-profiilista.
        </p>

        <p>
          Helsinki-profiilin luomisen jälkeen olet tunnistautuneena siinä
          palvelussa, josta aloitit kirjautumisprosessin. Helsinki-profiiliin
          pääset osoitteessa{' '}
          <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>.
        </p>

        <p>
          Kun kirjaudut seuraavan kerran samaan palveluun, valitse vain
          valitsemasi tunnistautumisvaihtoehdoksi suomi.fi ja pääset palveluun.
        </p>
        <p>
          <UserGuideImage
            src={image008}
            alt="Ennen kuin voit käyttää haluamaasi palvelua tai ennen Helsinki-profiilin syntymistä, sinun pitää antaa suostumus tietojesi käytölle. Ilman suostumusta tietojasi ei voida käyttää eikä siten luoda profiilia."
          />
        </p>
      </UserGuideAccordion>
      <UserGuideAccordion
        id="_Helsinki-tunnuksen_käyttö"
        heading="Sähköposti-tunnistautuminen"
      >
        <h4>Tunnistautumisen valinta</h4>
        <p>
          Asiointipalvelussa Kirjaudu-linkin painamisen jälkeen näet erilaisia
          kirjautumisvaihtoehtoja, joista valitaan Luo Helsinki-profiili.
          Kirjautumisvaihtoehtojen näkymä vaihtelee eri asiointipalveluissa.
        </p>

        <p>
          <UserGuideImage
            src={image009}
            alt="Helsinki-tunnus koostuu sähköposti ja salasana -yhdistelmästä klikkaamalla Luo uusi Helsinki-profiili -painiketta."
          />
        </p>
        <h4>Sähköpostiosoitteen vahvistus</h4>
        <p>
          Tunnistautumisen jälkeen sinulta kysytään sähköpostiosoite.
          Sähköpostiosoitteeseen lähetetään vahvistusviesti osoitteen aitouden
          varmistamiseksi.
        </p>
        <p>
          Jos olet jo aiemmin luonut Helsinki-profiilin sähköpostiosoitteella ja
          salasanalla, voit käyttää samaa sähköpostiosoitetta. Tällöin eri
          tunnistautumistavat yhdistyvät, ja näet jatkossa kaikkien käyttämiesi
          palvelujen tiedot kerralla.
          <b> Huomaa kuitenkin, ettei yhdistämistä voi perua myöhemmin.</b>
        </p>
        <p>
          Sähköpostin vahvistamiseksi saat 6-numeroisen koodin antamaasi
          sähköpostiosoitteeseen. Jos viesti ei tule sähköpostiisi lähes
          välittömästi, tarkista roskaposti-kansiosi.
        </p>
        <p>
          <b>
            Älä sulje Helsinki-profiilin selainikkunaa, kun haet
            vahvistusviestin sähköpostistasi. Muuten järjestelmä olettaa sinun
            keskeyttäneen tunnistautumisprosessin.
          </b>
        </p>
        <p>
          <UserGuideImage src={image005} alt={altText05} />
        </p>
        <p>
          <UserGuideImage
            src={image006}
            alt="Sähköpostiviestissä on 6-numeroinen vahvistuskoodi, jolla varmennetaan, että sähköpostiosoite on aito."
          />
        </p>

        <p>
          <UserGuideImage
            src={image007}
            alt="Sähköpostin 6-numeroinen luku pitää kirjata selainikkunan vahvistuskoodi-kenttään."
          />
        </p>
        <h4>Helsinki-profiilin luonti</h4>
        <p>
          Sähköpostin vahvistamisen jälkeen täytä nimitietosi ja anna salasana.
          Salasanassa pitää olla vähintään 12 merkkiä, pieniä ja isoja
          kirjaimia, numeroita sekä erikoismerkkejä.
        </p>
        <p>
          Vahvista vielä suostumus tietojesi käyttöön. Ilman suostumusta
          Helsinki-profiilia ei voida luoda, eivätkä palvelut voi käyttää
          tietojasi.
        </p>
        <p>
          Nyt sinulle on luotu Helsinki-profiili. Palveluihin tunnistautumiseen
          tarvitsemasi Helsinki-tunnus on tämä
          sähköpostiosoite-salasana-yhdistelmä.
        </p>
        <p>
          <UserGuideImage
            src={image010}
            alt="Helsinki-profiilin luomisen yhteydessä pitää vielä täyttää nimitiedot ja antaa salasana. Sinun pitää myös antaa suostumus tietojesi käyttöön, jotta Helsinki-profiili voidaan luoda."
          />
        </p>
      </UserGuideAccordion>
      <UserGuideAccordion
        id="_Tunnistautumistapojen_yhdistäminen"
        heading="Tunnistautumistapojen yhdistäminen"
      >
        <p>
          Voit halutessasi yhdistää eri tunnistautumistavat yhdeksi
          Helsinki-profiiliksi, jolloin voit tarkastella ja hallinnoida kaikkia
          tietojasi ja hyödyntämiäsi palveluja kerralla. Tämä onnistuu tekemällä
          ensin Helsinki-tunnus sähköpostiosoite-salasana-yhdistelmällä ja
          käyttämällä sitten samaa sähköpostiosoitetta ensimmäisellä
          suomi.fi-tunnistautumisella.
        </p>

        <p>
          Jos Helsinki-profiili on luotu suomi.fi-tunnistautumisella,
          sisäänkirjautumisnäkymässä voi klikata{' '}
          <i>Olen unohtanut salasanani</i> -linkkiä. Tästä ohjeet seuraavassa
          osiossa <a href="#_Unohtunut_salasana">Unohtunut salasana</a>.
        </p>
      </UserGuideAccordion>
      <h2 id="_Kirjautuminen">Kirjautuminen</h2>
      <p>
        Helsinki-profiililla voit kirjautua kaikkiin Helsingin kaupungin
        digitaalisiin palveluihin. Kirjautumisen voit tehdä käyttämää
        suomi.fi-tunnistautumista tai profiilin luomisen yhteydessä antamasi
        sähköpostiosoitteen ja salasanan.
      </p>
      <UserGuideAccordion id="_Unohtunut_salasana" heading="Unohtunut salasana">
        <p>
          Jos et muista salasanaasi, voit luoda uuden kirjautumisikkunassa{' '}
          <i>Olen unohtanut salasanani</i> -linkistä. Salasanan ”unohtuminen”
          voi myös johtua siitä, että olet aiemmilla kerroilla kirjautunut
          palveluun suomi.fi-tunnistautuen, jolloin salasanaa ei ole luotu.
        </p>

        <p>
          Sähköpostin antamisen jälkeen saat sähköpostiisi linkin uuden
          salasanan antamiseen. Linkki on voimassa 30 minuuttia.
        </p>
        <p>
          Salasanan pitää olla vähintään 12 merkkiä pitkä. Siinä pitää käyttää
          sekä isoja että pieniä kirjaimia, numeroita ja erikoismerkkejä.
        </p>

        <p>
          <UserGuideImage
            src={image011}
            alt="Klikkaa kirjautumisikkunassa Olen unohtanut salasanani -linkkiä."
          />
        </p>
        <p>
          <UserGuideImage
            src={image012}
            alt="Syötä sähköpostiosoitteesi avautuvaan kenttään, jotta saat salasanan uusimislinkin sähköpostiisi."
          />
        </p>

        <p>
          <UserGuideImage
            src={image013}
            alt="Saat tiedon, että sinulle lähetetään sähköpostiviesti salasanan uusimista varten."
          />
        </p>

        <p>
          <UserGuideImage
            src={image014}
            alt="Saamassasi sähköpostiviestissä on linkki uuden salasanan antamista varten. Linkki on voimassa 30 minuuttia. "
          />
        </p>

        <p>
          <UserGuideImage
            src={image015}
            alt="Salasanan vaihtoikkunassa sinun pitää syöttää sama salasana kahteen kertaan. Salasanassa pitää olla vähintään 12 merkkiä. Salasanan pitää sisältää sekä isoja että pieniä kirjaimia, numeroita ja erikoismerkkejä."
          />
        </p>
      </UserGuideAccordion>
      <UserGuideAccordion
        id="_Ongelma_kirjautumisessa"
        heading="Ongelma kirjautumisessa"
      >
        <p>
          Kun siirryt palvelusta toiseen, tunnistautumistapa voi olla erilainen
          eri palveluissa. Esimerkiksi olit kirjautuneena ensimmäiseen palveluun
          Helsinki-tunnuksella eli sähköpostin ja salasanan yhdistelmällä, mutta
          toinen palvelu tarvitsee suomi.fi-tunnistautumisen. Tällöin saat
          ilmoituksen, ettei tunnistautumistapa ole yhteensopiva. Sinun tulee
          kirjautua ulos aiemmasta palvelusta, jotta voit tunnistautua uuteen
          palveluun. Kahta eri tunnistautumistapaa ei voi olla yhtaikaa avoinna.
        </p>

        <p>
          <UserGuideImage
            src={image016}
            alt="Yhteensopimaton kirjautumistapa tarkoittaa, että olet kirjautunut esimerkiksi yhteen palveluun sähköposti-salasana-yhdistelmällä ja siirryt käyttämään seuraavaa palvelua, joka tarvitseekin suomi.fi-tunnistautumisen. Tällöin sinun pitää kirjautua ulos ensimmäisestä palvelusta voidaksesi kirjautua uuteen palveluun."
          />
        </p>

        <p>
          <UserGuideImage
            src={image017}
            alt="Vahvista uloskirjautuminen aiemmasta palvelusta."
          />
        </p>
      </UserGuideAccordion>
      <h2 id="_Omien_tietojen_katselu">
        Omien tietojen katselu ja muokkaaminen
      </h2>
      <p>
        Kirjautumalla Helsinki-profiiliin osoitteessa{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a> voit
        katsella ja muokata omia tietojasi ja miten palvelut niitä käyttävät.
      </p>
      <UserGuideAccordion
        id="_Profiili_tietojen_muokkaaminen"
        heading="Profiili-tietojen muokkaaminen"
      >
        <p>
          Viralliset tiedot tulevat profiiliin ja näkyvät vain
          suomi.fi-tunnistautuen. Näiden tietojen päivittäminen tehdään
          väestörekisterikeskuksen palvelussa.
        </p>
        <p>
          Helsinki-profiilin omissa tiedoissa voit lisätä puhelinnumeron,
          vaihtaa sähköpostiosoitteen ja lisätä osoitetiedot. Jos vaihdat
          nimitietosi Helsinki-profiilissa, niin seuraavalla
          suomi.fi-tunnistautumiskerralla viralliset tiedot päivittävät ne.
        </p>
        <p>
          Voit lisätä tai muuttaa itse syöttämiäsi tietoja Lisää-painikkeella
          tai Muokkaa-painikkeella. Tiedot tallentuvat tietokantaan
          Tallenna-painikkeella.
        </p>
        <p>
          Helsinki-profiilin asiointikieli-kohta määrittää, millä kielellä
          esimerkiksi palvelun sähköpostit lähetetään. Näet myös, miten olet
          tunnistautunut Helsinki-profiiliin.
        </p>

        <UserGuideImage
          src={image018}
          alt="Helsinki-profiilissa Omat tiedot -osiossa Viralliset tiedot tulevat suoraan väestörekisterikeskuksesta ja niiden päivittäminen tehdään myös siellä."
        />
        <p>
          <UserGuideImage
            src={image019}
            alt="Helsinki-profiilissa Omat tiedot -osiossa Perustiedot ovat itse päivitettävissä."
          />
        </p>

        <p>
          <UserGuideImage
            src={image023}
            alt="Voit lisätä ja muokata muita osoitetietojasi, puhelinnumerosi ja sähköpostiosoitteesi."
          />
        </p>
      </UserGuideAccordion>
      <UserGuideAccordion
        id="_Tietojen_käsittely_eri"
        heading="Tietojen käsittely eri palveluissa"
      >
        <p>
          Palvelut hyödyntävät Helsinki-profiilin hallinnoimia tietoja
          ilmoittamallaan tavalla. Tunnistautumalla ensimmäisen kerran
          palveluun, näet mitä tietoja palvelu hyödyntää.
        </p>

        <p>
          Helsinki-profiilissa voit tarkistaa myöhemmin nämä tiedot sekä
          halutessasi poistaa tietosi palvelusta. Poisto ei ole mahdollista, jos
          asiointi on kesken palvelussa. On myös suositeltavaa{' '}
          <a href="#_Tietojen_lataaminen">ladata omat tiedot talteen</a> ennen
          poistoa.
        </p>

        <p>
          <UserGuideImage
            src={image024}
            alt="Tunnistautuessasi uuteen palveluun sinulta pyydetään suostumus palvelun tarvitsemien tietojesi käyttöön. Voit myöhemmin palata näihin tietoihin Helsinki-profiilin Käyttämäsi palvelut -välilehdellä."
          />
        </p>

        <p>
          <UserGuideImage
            src={image025}
            alt="Helsinki-profiilin Käyttämäsi palvelut -osiossa näet kaikki palvelut, joihin olet tunnistautunut ja mitä tietojasi ne käyttävät. Voit myös poistaa tietosi yksittäisistä palveluista."
          />
        </p>
      </UserGuideAccordion>
      <UserGuideAccordion
        id="_Tietojen_lataaminen"
        heading="Tietojesi lataaminen"
      >
        <p>
          Voit myös ladata eri palveluihin tallentamasi tiedot yhtenä
          json-tiedostona. Lisää tietoa{' '}
          <a href="https://fi.wikipedia.org/wiki/JSON">
            json-tiedostomuodosta Wikipediassa (linkki avautuu uuteen ikkunaan)
          </a>
          . Jos olet yhdistänyt suomi.fi-tunnistautumisen ja
          sähköpostiosoite+salasana-kirjautumisen samaan Helsinki-profiiliin,
          tietojen lataus pitää tehdä suomi.fi-tunnistautuneena.
          <p>
            <UserGuideImage
              src={image026}
              alt="Helsinki-profiilin Omat tiedot -osiossa voit ladata tietosi kaikista palveluista json-tiedostona."
            />
          </p>
        </p>
      </UserGuideAccordion>
      <h2 id="_Tietojen_poisto">Tietojen poisto</h2>
      <p>
        Voit poistaa tietosi joko yksittäisistä palveluista tai koko profiilin.
        Poiston myötä kaikki tietosi palvelusta poistetaan tai anonymisoidaan,
        jos palvelu esim. lakisääteisenä joutuu niitä säilyttämään. Sinulla ei
        kuitenkaan ole poiston jälkeen pääsyä tietoihin, eikä niitä ole
        yhdistettävissä sinuun.
      </p>
      <UserGuideAccordion
        id="_Tietojen_poisto"
        heading="Tietojesi poisto yksittäisestä palvelusta"
      >
        <p>
          Jos olet yhdistänyt suomi.fi-tunnistautumisen ja
          sähköpostiosoite+salasana-kirjautumisen samaan Helsinki-profiiliin,
          palvelun poistaminen pitää tehdä suomi.fi-tunnistautuneena.
        </p>

        <p>
          Kun valitset poistettavan palvelun Käyttämäsi palvelut -välilehdellä,
          saat pop-up-ikkunaan vahvistusviestin poistosta.
        </p>

        <p>
          <UserGuideImage
            src={image027}
            alt="Voit poistaa tietosi Helsinki-profiilissa yksittäisen palvelun kohdalla Käyttämäsi palvelut -osiossa."
          />
        </p>

        <p>
          <UserGuideImage
            src={image028}
            alt='Klikattuasi "Poista tietosi tästä palvelusta"-painiketta saat vielä pop-up-vahvistusviestin ruudulle, jotta tietoja ei poisteta vahingossa.'
          />
        </p>
      </UserGuideAccordion>
      <UserGuideAccordion
        id="_Profiilin_poisto"
        heading="Helsinki-profiilin poisto"
      >
        <p>
          Jos haluat poistaa koko Helsinki-profiilin, voit tehdä sen Poista omat
          tiedot -näppäintä painamalla. Tämän jälkeen ruudulle tulee
          pop-up-ikkuna, jossa vielä varmistetaan, että haluat poistaa tietosi.
          Vahvistamalla pyynnön kaikki tiedot poistetaan profiilista sekä
          kaikista asiointipalveluista, jos mitään asiointia ei ole kesken.
        </p>

        <p>
          Jotkin lakisääteiset asiointipalvelut voivat edellyttää tietojen
          säilyttämistä määräajan tai pysyvästi. Asioinnista ja
          asiointipalvelusta riippuen tiedot voidaan anonymisoida joissakin
          tapauksissa. Jos lakisääteisen palvelun pitää säilyttää tiedot,
          tällöin profiilia tai kyseisen palvelun käyttöoikeutta tietoihin ei
          voida poistaa.
        </p>

        <p>
          Jos olet yhdistänyt suomi.fi-tunnistautumisen ja
          sähköpostiosoite+salasana-kirjautumisen samaan Helsinki-profiiliin,
          profiilin poisto pitää tehdä suomi.fi-tunnistautuneena.
        </p>

        <p>
          Helsinki-profiilin poistamisen jälkeen voit aina tarvittaessa tehdä
          uuden profiilin, mutta kaikki aiemmat tiedot on menetetty.
        </p>

        <p>
          <UserGuideImage
            src={image029}
            alt="Helsinki-profiilin Omat tiedot -osiossa on painike Poista omat tiedot, jolla voit poistaa koko Helsinki-profiilin ja eri palveluissa käytetyt tietosi."
          />
        </p>

        <p>
          <UserGuideImage
            src={image030}
            alt="Ruudulle tulee vielä varmistusviesti pop-up-ikkunaan, jotta tietoja ei poisteta vahingossa."
          />
        </p>
      </UserGuideAccordion>
    </Fragment>
  );
}

export default UserGuideFi;
