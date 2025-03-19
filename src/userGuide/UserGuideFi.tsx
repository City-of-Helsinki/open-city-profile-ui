/* eslint-disable max-len */
import React, { Fragment, ReactElement } from 'react';
import { IconDownload, Link } from 'hds-react';

import styles from './UserGuide.module.css';
import UserGuideAccordion from './UserGuideAccordion';
import UserGuideImage from './UserGuideImage';
import TableOfContents from '../profile/components/tableOfContents/TableOfContents';
import image001 from './assets/01-sisaankirjautuminen.png';
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
import image031 from './assets/01-salasana-vaihto-fi.png';
import image032 from './assets/02-salasana-vaihto-keycloak-fi.png';
import image2fa01 from './assets/01-2fa-kayttoonnotto-fi.jpg';
import image2fa02 from './assets/02-2fa-kayttoonotto-keycloak-fi.jpg';
import image2fa03 from './assets/03-2fa-kirjautuminen-fi.jpg';
import image2fa04 from './assets/04-2fa-kaytostapoisto-fi.jpg';
import image2fa05 from './assets/05-2fa-kaytostapoisto-varmistus-fi.jpg';
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

const altText05 = `Sähköpostiosoite toimii tunnuksenasi Helsingin kaupungin palveluihin. Käyttämällä samaa sähköpostiosoitetta sekä
  Suomi.fi-tunnistautumisessa että Helsinki-tunnuksella, saat yhden Helsinki-profiilin. Yhdistämistä ei voi purkaa myöhemmin.`;

const lang = 'fi';

function UserGuideFi(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Helsinki-profiilin ohje</FocusableH1>
      <p>
        Helsinki-profiili on kaupungin digitaalisten asiointipalvelujen
        käyttäjän asiakasprofiili, joka toimii ensisijaisena
        tunnistautumistapana kaupungin palveluihin. Profiili kokoaa yhteen
        paikkaan käyttäjän henkilö- ja yhteystiedot sekä yhteydet eri kaupungin
        palveluihin. Profiilissa voit hallinnoida omia tietojasi ja niiden
        näkyvyyttä eri palveluissa.
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

      <TableOfContents items={tableOfContents} heading="Tällä sivulla" />

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
        Helsinki-profiilin voit luoda käyttäen Suomi.fi-tunnistautumista tai
        sähköpostia ja salasanaa. Helsingin kaupungin digitaalisiin palveluihin
        voi myös kirjautua Google- tai Yle-tunnuksilla, jotka poistuvat käytöstä
        vuoden 2024 aikana.
      </p>
      <UserGuideAccordion
        language={lang}
        id="_Suomi.fi-tunnistautuminen"
        heading="Suomi.fi-tunnistautuminen"
      >
        <h4>Tunnistautumisen valinta</h4>
        <p>
          Asiointipalvelussa Kirjaudu-linkin painamisen jälkeen näet erilaisia
          kirjautumisvaihtoehtoja, joista valitaan Suomi.fi-tunnistautuminen.
          Kirjautumisvaihtoehtojen näkymä vaihtelee eri asiointipalveluissa.
        </p>

        <UserGuideImage
          src={image001}
          alt="Tunnistautumisikkunassa valitaan Suomi.fi-tunnistautuminen."
        />

        <h4>Tunnistautuminen Suomi.fi-palvelussa</h4>

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

        <UserGuideImage
          src={image003}
          alt="Valitse oma pankkisi tai mobiilivarmenne Suomi.fi-tunnistautumisvaihtoehtona."
        />

        <UserGuideImage
          src={image004}
          alt="Tarkista, että tietosi ovat oikein, kun siirryt takaisin Helsingin kaupungin palveluun."
        />

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
          palvelujen tiedot kerralla.{' '}
          <b>Huomaa kuitenkin, ettei yhdistämistä voi perua myöhemmin.</b>
        </p>

        <p>
          Sähköpostin vahvistamiseksi saat antamaasi sähköpostiosoitteeseen
          6-numeroisen koodin. Syötä koodi ruudulla näkyvään kenttään. Jos
          viesti ei tule sähköpostiisi lähes välittömästi, tarkista
          roskapostikansiosi.
        </p>

        <p>
          <b>
            Älä sulje Helsinki-profiilin selainikkunaa, kun haet
            vahvistusviestin sähköpostistasi. Muuten järjestelmä olettaa sinun
            keskeyttäneen tunnistautumisprosessin.
          </b>
        </p>

        <UserGuideImage src={image005} alt={altText05} />

        <UserGuideImage
          src={image006}
          alt="Sähköpostiviestissä on 6-numeroinen vahvistuskoodi, jolla varmennetaan, että sähköpostiosoite on aito."
        />

        <UserGuideImage
          src={image007}
          alt="Sähköpostin 6-numeroinen luku pitää kirjata selainikkunan vahvistuskoodi-kenttään."
        />

        <h4>Helsinki-profiilin luonti</h4>

        <p>
          Sähköpostin vahvistamisen jälkeen sinun pitää vielä tarkistaa tietosi
          ja antaa suostumus tietojesi käyttöön. Ilman suostumusta
          Helsinki-profiilia ei voida luoda, eivätkä palvelut voi käyttää
          tietojasi.
        </p>

        <p>
          Tämän jälkeen sinulle syntyy Helsinki-profiili ja
          Suomi.fi-tunnistautumisen tiedot tallentuvat profiiliin. Eri
          asiointipalvelut hyödyntävät tietojasi eri tavoin, mutta nämä tiedot
          kerrotaan aina ensimmäisellä kirjautumiskerralla. Tiedot löytyvät myös
          aina Helsinki-profiilista.
        </p>

        <p>
          Helsinki-profiilin luomisen jälkeen olet tunnistautuneena siinä
          palvelussa, josta aloitit kirjautumisprosessin. Helsinki-profiiliin
          pääset osoitteessa{' '}
          <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>.
        </p>

        <p>
          Kun kirjaudut seuraavan kerran samaan palveluun, valitse
          tunnistautumisvaihtoehdoksi Suomi.fi.
        </p>

        <UserGuideImage
          src={image008}
          alt="Ennen kuin voit käyttää haluamaasi palvelua tai luoda Helsinki-profiilin, sinun pitää antaa suostumus tietojesi käyttöön. Ilman suostumusta tietojasi ei voida käyttää eikä profiilia voida luoda."
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Helsinki-tunnuksen_käyttö"
        heading="Sähköposti-tunnistautuminen"
      >
        <h4>Tunnistautumisen valinta</h4>
        <p>
          Asiointipalvelussa Kirjaudu-linkin painamisen jälkeen näet erilaisia
          kirjautumisvaihtoehtoja, joista valitaan Luo Helsinki-profiili.
          Kirjautumisvaihtoehtojen näkymä vaihtelee eri asiointipalveluissa.
        </p>

        <UserGuideImage
          src={image009}
          alt="Helsinki-tunnus koostuu sähköposti ja salasana -yhdistelmästä klikkaamalla Luo uusi Helsinki-profiili-painiketta."
        />

        <h4>Sähköpostiosoitteen vahvistus</h4>
        <p>
          Profiilin luomisen yhteydessä sinulta pyydetään sähköpostiosoite, joka
          toimii myös käyttäjätunnuksenasi. Sähköpostiosoitteeseen lähetetään
          vahvistusviesti osoitteen aitouden varmistamiseksi.
        </p>
        <p>
          Jos olet jo aiemmin luonut Helsinki-profiilin Suomi.fi-tunnistautuen,
          voit luoda profiilille salasanan klikkaamalla Olen unohtanut
          salasanani -linkkiä. Salasanan luomisesta on enemmän{' '}
          <a href="#_Unohtunut_salasana"> Unohtunut salasana</a> -kohdassa.
          Tällöin eri tunnistautumistavat yhdistyvät, ja näet jatkossa kaikkien
          käyttämiesi palvelujen tiedot kerralla.{' '}
          <b>Huomaa kuitenkin, ettei yhdistämistä voi perua myöhemmin.</b>
        </p>
        <p>
          Sähköpostin vahvistamiseksi saat antamaasi sähköpostiosoitteeseen
          6-numeroisen koodin. Syötä koodi ruudulla näkyvään kenttään. Jos
          viesti ei tule sähköpostiisi lähes välittömästi, tarkista
          roskapostikansiosi.
        </p>
        <p>
          <b>
            Älä sulje Helsinki-profiilin selainikkunaa, kun haet
            vahvistusviestin sähköpostistasi. Muuten järjestelmä olettaa sinun
            keskeyttäneen tunnistautumisprosessin.
          </b>
        </p>

        <UserGuideImage src={image005} alt={altText05} />

        <UserGuideImage
          src={image006}
          alt="Sähköpostiviestissä on 6-numeroinen vahvistuskoodi, jolla varmennetaan, että sähköpostiosoite on aito."
        />

        <UserGuideImage
          src={image007}
          alt="Sähköpostin 6-numeroinen luku pitää kirjata selainikkunan vahvistuskoodi-kenttään."
        />

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

        <UserGuideImage
          src={image010}
          alt={`Helsinki-profiilin luomisen yhteydessä pitää vielä täyttää nimitiedot ja antaa
            salasana. Sinun pitää myös antaa suostumus tietojesi käyttöön, jotta Helsinki-profiili voidaan luoda.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Tunnistautumistapojen_yhdistäminen"
        heading="Tunnistautumistapojen yhdistäminen"
      >
        <p>
          Voit halutessasi yhdistää eri tunnistautumistavat yhdeksi
          Helsinki-profiiliksi, jolloin voit tarkastella ja hallinnoida kaikkia
          tietojasi ja hyödyntämiäsi palveluja kerralla. Yhdistääksesi
          tunnistautumistavat, luo ensin Helsinki-tunnus
          sähköpostiosoite-salasana-yhdistelmällä. Käytä sitten samaa
          sähköpostiosoitetta, kun kirjaudut ensimmäistä kertaa käyttäen
          Suomi.fi-tunnistautumista.
        </p>
        <p>
          <b>Huomaa kuitenkin, ettei yhdistämistä voi perua myöhemmin.</b>
        </p>
        <p>
          Jos Helsinki-profiili on luotu Suomi.fi-tunnistautumisella,
          sisäänkirjautumisnäkymässä voi klikata{' '}
          <i>Olen unohtanut salasanani</i> -linkkiä. Tästä ohjeet seuraavassa
          osiossa <a href="#_Unohtunut_salasana">Unohtunut salasana</a>.
        </p>
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Kaksivaiheinen_tunnistautuminen"
        heading="Kaksivaiheinen tunnistautuminen"
      >
        <p>
          Kaksivaiheinen tunnistautuminen lisää tilisi turvallisuutta. Kun otat
          sen käyttöön, Helsinki-profiili kirjautumisen yhteydessä tarvitaan
          salasanan lisäksi myös erillinen kertakäyttöinen koodi, jonka saat
          todennussovelluksesta.
        </p>

        <h4>Kaksivaiheisen tunnistautumisen käyttöönotto</h4>

        <p>
          Voit ottaa kaksivaiheisen tunnistautumisen käyttöön Helsinki-profiilin
          Omat tiedot-sivulla <i>Kirjautuminen ja tunnistautuminen</i>-osiossa.
        </p>

        <UserGuideImage
          src={image2fa01}
          alt="Kaksivaiheinen tunnistautuminen Omat tiedot-sivulla."
        />

        <UserGuideImage
          src={image2fa02}
          alt="Kaksivaiheisen tunnistautumisen käyttöönottonäkymä. Seuraa numeroituja ohjeita."
        />
        <p>
          Seuraa käyttöönoton ohjeita ja lataa mobiililaitteellesi
          vapaavalintainen todennussovellus kuten Google Authenticator,
          Microsoft Authenticator tai FreeOTP.
        </p>
        <p>
          Avaa todennussovellus ja skannaa näytöllä näkyvä QR-koodi. Jos et voi
          skannata koodia, voit syöttää sen manuaalisesti valitsemalla{' '}
          <i>&quot;Etkö voi lukea koodia?&quot;</i> -linkin.
        </p>
        <p>
          <b>
            Ota linkistä avautuva koodi talteen mahdollisten ongelmatilanteiden,
            esimerkiksi puhelimen hajoamisen takia, jotta pääsy tilille säilyy.
          </b>
        </p>
        <p>
          Todennussovellus luo kertakäyttöisen koodin, jonka syötät
          Helsinki-profiilin käyttöönottonäkymässä kohdassa 3.
        </p>
        <p>
          <b>
            Älä sulje Helsinki-profiilin selainikkunaa, kun haet kertakäyttöisen
            koodin todennussovelluksestasi. Muuten järjestelmä olettaa sinun
            keskeyttäneen aktivointiprosessin.
          </b>
        </p>
        <p>
          Kun vahvistus onnistuu, kaksivaiheinen tunnistautuminen on käytössä,
          ja näet sen aktivoituna Omat tiedot-sivulla.
        </p>

        <h4>Kirjautuminen kaksivaiheisen tunnistautumisen kanssa</h4>

        <p>
          Jos tililläsi on kaksivaiheinen tunnistus käytössä kirjautuessasi
          sähköpostilla, järjestelmä kysyy sinulta kertakäyttöistä koodia, jonka
          aiemmin määritelty todennusovelluksesi generoi.
        </p>

        <UserGuideImage
          src={image2fa03}
          alt="Hae ja liitä kertakäyttökoodi todennussovelluksestasi tähän näkymään."
        />

        <p>
          Siirry todennussovellukseesi, kopioi koodi ja liitä se Profiilin
          kirjautumisnäkymään. Koodi on yleensä voimassa minuutin ajan.
        </p>

        <p>
          <b>
            Älä sulje Helsinki-profiilin selainikkunaa, kun haet kertakäyttöisen
            koodin todennussovelluksestasi. Muuten järjestelmä olettaa sinun
            keskeyttäneen kirjautumisprosessin.
          </b>
        </p>
        <p>
          Jos sinulla ei ole pääsyä todennussovellukseesi, kirjaudu sisään
          profiiliin suomi.fi-tunnistautumisella ja seuraa{' '}
          <a href="#_Todennus_sovellus_ei">
            Todennussovellus ei ole käytettävissä tai koodi ei toimi
          </a>{' '}
          -osion ohjeita.
        </p>

        <h4>Kaksivaiheisen tunnistautumisen käytöstä poisto</h4>

        <p>
          Voit ottaa kaksivaiheisen tunnistautumisen pois käytöstä Omat
          tiedot-sivulla.
        </p>

        <UserGuideImage
          src={image2fa04}
          alt="Poista kaksivaiheinen tunnistautuminen käytöstä painamalla “Poista käytöstä”-painiketta."
        />

        <p>
          Järjestelmä pyytää sinua vahvistamaan poistamisen
          kirjautumistiedoillasi ja todennussovelluksen kertakäyttöisellä
          koodilla.{' '}
        </p>

        <UserGuideImage
          src={image2fa05}
          alt="Varmistus kaksivaiheisen tunnistautumisen poistosta."
        />

        <p>
          Poiston jälkeen muista poistaa myös todennussovelluksestasi
          Helsinki-profiiliin liittyvä linkitys/tili.
        </p>

        <p>
          Voit ottaa kaksivaiheisen tunnistautumisen käyttöön uudelleen milloin
          tahansa profiilin tiedoista.
        </p>
        <p>
          Jos sinulla on käytössäsi ns. hybridi-tili, johon on yhdistetty sekä
          kevyt tunnistautuminen että vahva suomi.fi-tunnistautuminen, voit
          poistaa kaksivaiheisen tunnistautumisen myös
          suomi.fi-tunnistautumalla.
        </p>

        <h4 id="_Todennus_sovellus_ei">
          Todennussovellus ei ole käytettävissä tai koodi ei toimi
        </h4>
        <p>
          Jos sinulla ei ole pääsyä todennussovellukseesi esimerkiksi puhelimen
          vaihdon myötä, voit tunnistautua Helsinki-profiiliin vahvasti
          suomi.fi-tunnuksella, jolloin pääset ottamaan kaksivaiheisen
          tunnistautumisen pois päältä Omat tiedot-sivulta.
        </p>
        <p>
          Jos sinulla ei vielä ole suomi.fi-tunnistautuminen käytössä, voit
          ottaa sen käyttöön tunnistautumalla suomi.fi:llä ja luomalla{' '}
          <b>samalla sähköpostiosoitteella</b> vahvan tunnistautumisen tilin.
          Samalla sähköpostiosoitteella kevyt ja vahva tunnistautuminen
          yhdistyvät ja voit ottaa kaksivaiheisen tunnistautumisen pois päältä.
        </p>
        <p>
          Jos sinulla on jo suomi.fi-tunnistautuminen käytössä eri
          sähköpostiosoitteella, valitettavasti kaksivaiheisen tunnistautumisen
          pois päältä ottaminen ei enää onnistu. Tästä johtuen{' '}
          <b>alkuvaiheen tunnistekoodin tallentaminen on erittäin tärkeää.</b>
        </p>
      </UserGuideAccordion>

      <h2 id="_Kirjautuminen">Kirjautuminen</h2>
      <p>
        Helsinki-profiililla voit kirjautua Helsingin kaupungin digitaalisiin
        palveluihin. Voit käyttää kirjautumiseen Suomi.fi-tunnistautumista tai
        profiilin luomisen yhteydessä annettua sähköpostiosoitetta ja salasanaa.
      </p>
      <UserGuideAccordion
        language={lang}
        id="_Unohtunut_salasana"
        heading="Unohtunut salasana"
      >
        <p>
          Jos et muista salasanaasi, voit luoda uuden kirjautumisikkunassa{' '}
          <i>Olen unohtanut salasanani</i> -linkistä. Salasanan ”unohtuminen”
          voi myös johtua siitä, että olet aiemmilla kerroilla kirjautunut
          palveluun Suomi.fi-tunnistautuen, jolloin salasanaa ei ole luotu.
        </p>

        <p>
          Sähköpostin antamisen jälkeen saat sähköpostiisi linkin uuden
          salasanan antamiseen. Linkki on voimassa 30 minuuttia.
        </p>
        <p>
          Salasanan pitää olla vähintään 12 merkkiä pitkä. Siinä pitää käyttää
          sekä isoja että pieniä kirjaimia, numeroita ja erikoismerkkejä.
        </p>

        <UserGuideImage
          src={image011}
          alt="Klikkaa kirjautumisikkunassa Olen unohtanut salasanani -linkkiä."
        />

        <UserGuideImage
          src={image012}
          alt="Syötä sähköpostiosoitteesi avautuvaan kenttään, jotta saat salasanan uusimislinkin sähköpostiisi."
        />

        <UserGuideImage
          src={image013}
          alt="Saat tiedon, että sinulle lähetetään sähköpostiviesti salasanan uusimista varten."
        />

        <UserGuideImage
          src={image014}
          alt="Saamassasi sähköpostiviestissä on linkki uuden salasanan antamista varten. Linkki on voimassa 30 minuuttia. "
        />

        <UserGuideImage
          src={image015}
          alt={`Salasanan vaihtoikkunassa sinun pitää syöttää sama salasana kahteen kertaan. Salasanassa pitää olla
            vähintään 12 merkkiä. Salasanan pitää sisältää sekä isoja että pieniä kirjaimia, numeroita ja erikoismerkkejä.`}
        />
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Salasanan_vaihto"
        heading="Salasanan vaihto"
      >
        <p>
          Voit vaihtaa salasanasi uuteen milloin tahansa Omat tiedot-sivulta
          osiosta <i>Kirjautuminen ja tunnistautuminen.</i>
        </p>

        <UserGuideImage
          src={image031}
          alt="Salasanan vaihtaminen Omat tiedot-sivulla."
        />

        <p>
          Jos tililläsi on käytössä kaksivaiheinen tunnistus, salasanaa
          vaihtaessasi tarvitset kertakäyttöisen koodin todennussovelluksestasi.
          Apua kaksivaiheisen tunnistuksen ongelmiin löydät tämän ohjeen osiosta{' '}
          <i>“Kaksivaiheinen tunnistautuminen.”</i>
        </p>

        <UserGuideImage
          src={image032}
          alt="Silmäikonia painamalla voit näyttää tai piilottaa salasanan näkymässä."
        />

        <p>
          Kirjoita kenttään valitsemasi uusi salasana. Salasanassa pitää olla
          vähintään 12 merkkiä. Salasanan pitää sisältää sekä isoja että pieniä
          kirjaimia, numeroita ja erikoismerkkejä. Silmäikonia painamalla voit
          näyttää tai piilottaa salasanan.{' '}
        </p>
      </UserGuideAccordion>

      <UserGuideAccordion
        language={lang}
        id="_Ongelma_kirjautumisessa"
        heading="Ongelma kirjautumisessa"
      >
        <p>
          Kun siirryt palvelusta toiseen, tunnistautumistapa voi olla erilainen
          eri palveluissa. Esimerkiksi olit kirjautuneena ensimmäiseen palveluun
          Helsinki-tunnuksella eli sähköpostin ja salasanan yhdistelmällä, mutta
          toinen palvelu tarvitsee Suomi.fi-tunnistautumisen. Tällöin saat
          ilmoituksen, ettei tunnistautumistapa ole yhteensopiva. Sinun tulee
          kirjautua ulos aiemmasta palvelusta, jotta voit tunnistautua uuteen
          palveluun. Kahta eri tunnistautumistapaa ei voi olla samaan aikaa
          avoinna.
        </p>

        <UserGuideImage
          src={image016}
          alt="Yhteensopimaton kirjautumistapa tarkoittaa, että olet kirjautunut esimerkiksi yhteen palveluun sähköposti-salasana-yhdistelmällä ja siirryt käyttämään seuraavaa palvelua, joka tarvitseekin Suomi.fi-tunnistautumisen. Tällöin sinun pitää kirjautua ulos ensimmäisestä palvelusta voidaksesi kirjautua uuteen palveluun."
        />

        <UserGuideImage
          src={image017}
          alt="Vahvista uloskirjautuminen aiemmasta palvelusta."
        />
      </UserGuideAccordion>
      <h2 id="_Omien_tietojen_katselu">
        Omien tietojen katselu ja muokkaaminen
      </h2>
      <p>
        Kirjautumalla Helsinki-profiiliin osoitteessa{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a>
        voit katsella ja muokata omia tietojasi ja sitä, miten palvelut niitä
        käyttävät.
      </p>
      <UserGuideAccordion
        language={lang}
        id="_Profiili_tietojen_muokkaaminen"
        heading="Profiili-tietojen muokkaaminen"
      >
        <p>
          Viralliset tiedot tulevat profiiliin ja näkyvät vain, kun käytät
          Suomi.fi-tunnistautumista. Näiden tietojen päivittäminen tehdään
          väestörekisterikeskuksen palvelussa.
        </p>
        <p>
          Helsinki-profiilin omissa tiedoissa voit lisätä puhelinnumeron,
          vaihtaa sähköpostiosoitteen ja lisätä osoitetiedot. Jos vaihdat
          nimitietosi Helsinki-profiilissa, niin seuraavalla
          Suomi.fi-tunnistautumiskerralla nimitiedot päivittyvät
          väestötietojärjestelmän tietojen mukaisesti.
        </p>
        <p>
          Voit lisätä tai muuttaa itse syöttämiäsi tietoja Lisää-painikkeella
          tai Muokkaa-painikkeella. Tiedot tallentuvat tietokantaan
          Tallenna-painikkeella.
        </p>
        <p>
          Helsinki-profiilin asiointikieli-kohta määrittää, millä kielellä
          esimerkiksi palvelun sähköpostit lähetetään. Näet myös miten olet
          tunnistautunut Helsinki-profiiliin.
        </p>

        <UserGuideImage
          src={image018}
          alt="Helsinki-profiilissa Omat tiedot -osiossa Viralliset tiedot tulevat suoraan väestörekisterikeskuksesta ja niiden päivittäminen tehdään myös siellä."
        />

        <UserGuideImage
          src={image019}
          alt="Helsinki-profiilissa Omat tiedot -osiossa Perustiedot ovat itse päivitettävissä."
        />

        <UserGuideImage
          src={image023}
          alt="Voit lisätä ja muokata muita osoitetietojasi, puhelinnumerosi ja sähköpostiosoitteesi. Asiointikieli määrittää, millä kielellä saat viestejä palvelusta. Tunnistautumistapa kertoo, millä tavalla olet kirjautunut palveluun eli Suomi.fi-tunnistautuen tai sähköposti-salasana-yhdistelmällä eli Helsinki-tunnuksella."
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Tietojen_käsittely_eri"
        heading="Tietojen käsittely eri palveluissa"
      >
        <p>
          Palvelut hyödyntävät Helsinki-profiilin hallinnoimia tietoja
          ilmoittamallaan tavalla. Kirjautumalla ensimmäisen kerran palveluun
          näet mitä tietoja palvelu hyödyntää.
        </p>

        <p>
          Helsinki-profiilissa voit tarkistaa myöhemmin nämä tiedot sekä
          halutessasi poistaa tietosi palvelusta. Poisto ei ole mahdollista, jos
          asiointi on kesken palvelussa. On myös suositeltavaa{' '}
          <a href="#_Tietojen_lataaminen">ladata omat tiedot talteen</a> ennen
          poistoa.
        </p>

        <UserGuideImage
          src={image024}
          alt={`Tunnistautuessasi uuteen palveluun sinulta pyydetään suostumus palvelun tarvitsemien tietojesi käyttöön.
            Voit myöhemmin palata näihin tietoihin Helsinki-profiilin Käyttämäsi palvelut -välilehdellä.`}
        />

        <UserGuideImage
          src={image025}
          alt={`Helsinki-profiilin Käyttämäsi palvelut -osiossa näet kaikki palvelut, joihin olet tunnistautunut ja mitä
            tietojasi ne käyttävät. Voit myös poistaa tietosi yksittäisistä palveluista.`}
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Tietojen_lataaminen"
        heading="Tietojesi lataaminen"
      >
        <p>
          Voit ladata eri palveluihin tallentamasi tiedot yhtenä
          json-tiedostona. Lisää tietoa{' '}
          <a href="https://fi.wikipedia.org/wiki/JSON">
            json-tiedostomuodosta Wikipediassa (linkki avautuu uuteen ikkunaan)
          </a>
          . Jos olet yhdistänyt Suomi.fi-tunnistautumisen ja
          sähköpostiosoite-salasana-kirjautumisen samaan Helsinki-profiiliin,
          tietojen lataus pitää tehdä Suomi.fi-tunnistautuneena.
        </p>
        <UserGuideImage
          src={image026}
          alt="Helsinki-profiilin Omat tiedot -osiossa voit ladata tietosi kaikista palveluista json-tiedostona."
        />
      </UserGuideAccordion>
      <h2 id="_Tietojen_poisto">Tietojen poisto</h2>
      <p>
        Voit poistaa tietosi yksittäisistä palveluista tai halutessasi koko
        profiilin. Poiston myötä kaikki tietosi palvelusta poistetaan. Jos
        palvelu joutuu esim. lakisääteisistä syistä säilyttämään tietoja, tiedot
        anonymisoidaan poiston sijaan. Sinulla ei kuitenkaan ole poiston jälkeen
        pääsyä tietoihin, eikä niitä voi yhdistää sinuun.
      </p>
      <UserGuideAccordion
        language={lang}
        id="_Tietojen_poisto"
        heading="Tietojesi poisto yksittäisestä palvelusta"
      >
        <p>
          Jos olet yhdistänyt Suomi.fi-tunnistautumisen ja
          sähköpostiosoite-salasana-kirjautumisen samaan Helsinki-profiiliin,
          palvelun poistaminen pitää tehdä Suomi.fi-tunnistautuneena.
        </p>

        <p>
          Kun valitset poistettavan palvelun Käyttämäsi palvelut -välilehdellä,
          saat ponnahdusikkunaan vahvistusviestin poistosta.
        </p>

        <UserGuideImage
          src={image027}
          alt="Voit poistaa tietosi Helsinki-profiilissa yksittäisen palvelun kohdalla Käyttämäsi palvelut -osiossa."
        />

        <UserGuideImage
          src={image028}
          alt='Klikattuasi "Poista tietosi tästä palvelusta"-painiketta saat vielä ponnahdusikkunaan vahvistusviestin ruudulle, jotta tietoja ei poisteta vahingossa.'
        />
      </UserGuideAccordion>
      <UserGuideAccordion
        language={lang}
        id="_Profiilin_poisto"
        heading="Helsinki-profiilin poisto"
      >
        <p>
          Jos haluat poistaa koko Helsinki-profiilin, voit tehdä sen Poista omat
          tiedot -näppäintä painamalla. Tämän jälkeen sinulta vielä
          varmistetaan, että haluat poistaa tietosi. Vahvistamalla pyynnön
          kaikki tiedot poistetaan profiilista sekä kaikista
          asiointipalveluista, jos mitään asiointia ei ole kesken.
        </p>

        <p>
          Jotkin lakisääteiset asiointipalvelut voivat edellyttää tietojen
          säilyttämistä määräajan tai pysyvästi. Asioinnista ja
          asiointipalvelusta riippuen tiedot voidaan joissakin tapauksissa
          anonymisoida. Jos lakisääteisen palvelun pitää säilyttää tiedot,
          tällöin profiilia tai kyseisen palvelun käyttöoikeutta tietoihin ei
          voida poistaa.
        </p>

        <p>
          Jos olet yhdistänyt Suomi.fi-tunnistautumisen ja
          sähköpostiosoite-salasana-kirjautumisen samaan Helsinki-profiiliin,
          profiilin poisto pitää tehdä Suomi.fi-tunnistautuneena.
        </p>

        <p>
          Helsinki-profiilin poistamisen jälkeen voit aina tarvittaessa tehdä
          uuden profiilin, mutta kaikki aiemmat tiedot on menetetty.
        </p>

        <UserGuideImage
          src={image029}
          alt="Helsinki-profiilin Omat tiedot -osiossa on painike Poista omat tiedot, jolla voit poistaa koko Helsinki-profiilin ja eri palveluissa käytetyt tietosi."
        />

        <UserGuideImage
          src={image030}
          alt="Ruudulle tulee vielä varmistusviesti ponnahdusikkunaan, jotta tietoja ei poisteta vahingossa."
        />
      </UserGuideAccordion>
    </Fragment>
  );
}

export default UserGuideFi;
