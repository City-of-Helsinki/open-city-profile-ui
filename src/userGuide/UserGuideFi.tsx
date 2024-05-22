/* eslint-disable max-len */
import React, { Fragment, ReactElement } from 'react';

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
import image020 from './assets/23-omat-yhteystiedot.png';
import image021 from './assets/24-asiointikieli.png';
import image022 from './assets/25-kirjautumistapa.png';
import image023 from './assets/26-olemassa-olevan-profiilin-kirjautuminen.png';
import image024 from './assets/27-kayttamasi-palvelut.png';
import image025 from './assets/28-tietojen-lataus.png';
import image026 from './assets/29-tietojen-poisto-palvelusta.png';
import image027 from './assets/30-tietojen-poisto-palvelusta-pop-up.png';
import image028 from './assets/31-tietojen-poisto-palvelusta-pop-up-varmistusviesti.png';
import image029 from './assets/32-tietojen-poisto.png';
import image030 from './assets/33-tietojen-poisto-popup.png';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function UserGuideFi(): ReactElement {
  return (
    <Fragment>
      <FocusableH1>Tietoa Helsinki-profiilista</FocusableH1>

      <h1>Helsinki-profiilin ohje</h1>

      <p>
        Helsinki-profiili on kaupungin digitaalisia asiointipalveluja käyttävän
        kaupunkilaisen asiakasprofiili. Se on ensisijainen tunnistautumistapa
        kaupungin digitaalisiin palveluihin. Helsinki-profiili kokoaa yhteen
        paikkaan asiakkaan henkilö- ja yhteystiedot sekä yhteydet eri kaupungin
        palveluihin. &nbsp;Profiilissa käyttäjä voi hallinnoida omia tietojaan
        ja niiden näkyvyyttä eri palvelussa.&nbsp;Helsinki-profiiliin ja sen
        avulla eri digitaalisiin sovelluksiin tunnistautuminen tapahtuu:
      </p>

      <p>suomi.fi-tunnistautumista käyttäen esimerkiksi pankkitunnuksilla</p>

      <p>
        Helsinki-tunnuksen sähköpostiosoite+salasana-yhdistelmällä, Google- tai
        Yle-tunnuksilla
      </p>

      <p>
        <a href="#_Palveluun_kirjautuminen">Palveluun tunnistautuminen</a>
      </p>

      <p>
        {' '}
        <a href="#_Suomi.fi-tunnistautuminen">Suomi.fi-tunnistautuminen</a>
      </p>

      <p>
        {' '}
        <a href="#_Helsinki-tunnuksen_käyttö">Helsinki-tunnus</a>
      </p>

      <p>
        <a href="#_Eri_tunnistautumistapojen_yhdistämi">
          Tunnistautumistapojen yhdistäminen
        </a>
      </p>

      <p>
        <a href="#_Salasanan_unohtaminen">Unohtunut salasana</a>
      </p>

      <p>
        <a href="#_Ongelma_kirjautumisessa">Ongelma tunnistautumisessa</a>
      </p>

      <p>
        <a href="#_Omien_tietojen_katselu">
          Omien tietojesi katselu ja muokkaaminen
        </a>
      </p>

      <p>
        <a href="#_Tietojesi_käsittely_eri">
          Tietojesi käsittely eri palveluissa
        </a>
      </p>

      <p>
        <a href="#_Tietojen_lataaminen">Tietojesi lataaminen</a>
      </p>

      <p>
        <a href="#_Tietojen_poisto">
          Tietojesi poisto palveluista ja Helsinki-profiilista
        </a>
      </p>

      <h2 id="_Palveluun_kirjautuminen">Palveluun tunnistautuminen</h2>

      <p>
        Yleisin tapa hyödyntää Helsinki-profiilia on kirjautua johonkin
        Helsingin kaupungin asiointipalveluun, jolloin Helsinki-profiili toimii
        henkilö- tai yhteystietojen välittäjänä.
      </p>

      <p>
        Ensimmäisellä kirjautumiskerralla sinua pyydetään luomaan
        Helsinki-profiili. Samalla sinua pyydetään antamaan suostumus kyseisen
        palvelun tarvitsemien tietojen käyttöön.{' '}
      </p>

      <p>
        Tunnistautuminen asiointipalveluun tapahtuu joko suomi.fi-tunnistautuen,
        esimerkiksi pankkitunnuksilla, tai sähköpostilla ja salasanalla.{' '}
      </p>

      <h3 id="_Suomi.fi-tunnistautuminen">Suomi.fi-tunnistautuminen</h3>

      <p>
        Asiointipalvelussa Kirjaudu-linkin painamisen jälkeen käyttäjä saa
        erilaisia kirjautumisvaihtoja tarjoavan näkymän, jossa valitaan
        suomi.fi-tunnistautuminen. Kirjautumisvaihtoehtojen näkymä vaihtelee eri
        asiointipalveluissa.
      </p>

      <p>
        <img
          width={217}
          height={397}
          src={image001}
          alt="Tunnistautumisikkunassa valitaan suomi.fi-tunnistautuminen."
        />
      </p>

      <p>
        <img
          width={404}
          height={251}
          src={image002}
          alt="Tunnistautumisikkunassa valitaan suomi.fi-tunnistautuminen."
        />
      </p>

      <p>
        Suomi.fi-tunnistautumisen valinnan jälkeen käyttäjä saa ruudulleen
        erilaisia tunnistautumistapoja. Vaihtoehdot ovat samat kuin muissakin
        julkishallinnon vahvaa tunnistautumista tarjoavissa palveluissa.
      </p>

      <p>
        <img
          width={482}
          height={388}
          src={image003}
          alt="Valitse oma pankkisi tai mobiilivarmenne suomi.fi-tunnistautumisvaihtoehtona."
        />
      </p>

      <p>
        Tunnistautumisen jälkeen tarkista, että käytettävät tiedot ovat oikein.
        Mikäli havaitset tiedoissa virheitä, ne tulee korjata
        väestörekisterikeskuksen palvelussa.
        <img
          width={482}
          height={259}
          src={image004}
          alt="Tarkista, että tietosi ovat oikein siirtyessäsi, kun siirryt takaisin Helsingin kaupungin palveluun."
        />
      </p>

      <p>
        Tunnistautumisen jälkeen sinulta kysytään sähköpostiosoite, joka pitää
        vahvistaa.
      </p>

      <p>
        Jos olet jo aiemmin luonut Helsinki-profiilin sähköpostiosoitteella ja
        salasanalla, voit käyttää samaa sähköpostiosoitetta. Tällöin eri
        tunnistautumistavat yhdistyvät, ja näet jatkossa kaikkien käyttämiesi
        palvelujen tiedot kerralla. Huomaa kuitenkin, ettei yhdistämistä voi
        perua myöhemmin.
      </p>

      <p>
        <img
          width={391}
          height={475}
          src={image005}
          alt="Sähköpostiosoite toimii tunnuksenasi Helsingin kaupungin palveluihin. Käyttämällä samaa sähköpostiosoitetta sekä suomi.fi-tunnistautumisessa että Helsinki-tunnuksella, saat yhden Helsinki-profiilin. Yhdistämistä ei voi purkaa myöhemmin."
        />
      </p>

      <p>
        Sähköpostin vahvistamiseksi saat 6-numeroisen koodin antamaasi
        sähköpostiosoitteeseen. Jos viesti ei tule sähköpostiisi lähes
        välittömästi, tarkista roskaposti-kansiosi.
      </p>

      <p>
        <b>
          Älä sulje Helsinki-profiilin selainikkunaa, kun haet vahvistusviestin
          sähköpostistasi. Muuten järjestelmä olettaa sinun keskeyttäneen
          tunnistautumisprosessin.
        </b>
      </p>

      <p>
        <img
          width={482}
          height={323}
          src={image006}
          alt="Sähköpostiviestissä on 6-numeroinen vahvistuskoodi, jolla varmennetaan, että sähköpostiosoite on aito."
        />
      </p>

      <p>
        Syötä numero ruudulla näkyvään kenttään.{' '}
        <img
          width={433}
          height={508}
          src={image007}
          alt="Sähköpostin 6-numeroinen luku pitää kirjata selainikkunan vahvistuskoodi-kenttään."
        />
      </p>

      <p>
        Sähköpostin vahvistamisen jälkeen sinun pitää vielä antaa suostumus
        tietojesi käyttöön. Ilman suostumusta Helsinki-profiilia ei voida luoda,
        eivätkä palvelut voi käyttää tietojasi.{' '}
        <img
          width={217}
          height={491}
          src={image008}
          alt="Ennen kuin voit käyttää haluaamaasi palvelua tai ennen Helsinki-profiilin syntymistä, sinun pitää antaa suostumus tietojesi käytölle. &#10;Ilman suostumusta tietojasi ei voida käyttää eikä siten luoda profiilia."
        />
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
        Tunnistautuessasi samaan palveluun seuraavalla kerralla valitset vain
        suomi.fi-tunnistautumisen, haluamasi tunnistautumisvaihtoehdon ja olet
        sisällä palvelussa.{' '}
      </p>

      <h3 id="_Helsinki-tunnuksen_käyttö">
        Sähköposti ja salasana -tunnistautuminen
      </h3>

      <p>Helsinki-profiilin muut tunnistautumisen vaihtoehdot ovat </p>

      <p>Helsinki-tunnus eli sähköposti ja salasana -yhdistelmä</p>

      <p>
        vuoden 2024 aikana Google- tai Yle-tunnus poistuvat käytöstä
        <img
          width={332}
          height={492}
          src={image009}
          alt="Helsinki-tunnus koostuu sähköposti ja salasana -yhdistelmästä klikkaamalla Luo uusi Helsinki-profiili -painiketta."
        />
      </p>

      <p>
        Sinulta kysytään sähköpostiosoite, johon lähetetään vahvistusviesti
        osoitteen aitouden varmistamiseksi.
      </p>

      <p>
        Jos olet jo aiemmin luonut Helsinki-profiilin suomi.fi-tunnistautuen,
        voit luoda profiilille salasanan klikkaamalla Olen unohtanut salasanani
        -linkkiä. Salasanan luomisesta on enemmän{' '}
        <a href="#_Unohtunut_salasana_1">Unohtunut salasana</a> -kohdassa
      </p>

      <p>
        Tällöin sekä suomi.fi-tunnistautumista että
        sähköposti-salasana-tunnistautumista vaativat palvelut löytyvät samasta
        Helsinki-profiilista ja voit hallinnoida kaikkia tietoja yhdessä
        näkymässä. Huomaa kuitenkin, ettei yhdistämistä voi perua myöhemmin.
      </p>

      <p>
        <img
          width={391}
          height={475}
          src={image005}
          alt="Sähköpostiosoite toimii tunnuksenasi Helsingin kaupungin palveluihin. Käyttämällä samaa sähköpostiosoitetta sekä suomi.fi-tunnistautumisessa että Helsinki-tunnuksella, saat yhden Helsinki-profiilin. Yhdistämistä ei voi purkaa myöhemmin."
        />
      </p>

      <p>
        Sähköpostin vahvistamiseksi saat 6-numeroisen koodin antamaasi
        sähköpostiosoitteeseen. Jos viesti ei tule sähköpostiisi lähes
        välittömästi, tarkista roskaposti-kansiosi.
      </p>

      <p>
        <b>
          Älä sulje Helsinki-profiilin selainikkunaa, kun haet vahvistusviestin
          sähköpostistasi. Muuten järjestelmä olettaa sinun keskeyttäneen
          tunnistautumisprosessin.
        </b>
      </p>

      <p>
        <img
          width={482}
          height={323}
          src={image006}
          alt="Sähköpostiviestissä on 6-numeroinen vahvistuskoodi, jolla varmennetaan, että sähköpostiosoite on aito."
        />
      </p>

      <p>
        Syötä numero ruudulla näkyvään kenttään.{' '}
        <img
          width={433}
          height={508}
          src={image007}
          alt="Sähköpostin 6-numeroinen luku pitää kirjata selainikkunan vahvistuskoodi-kenttään."
        />
      </p>

      <p>
        Sähköpostin vahvistamisen jälkeen sinun pitää vielä antaa suostumus
        tietojesi käyttöön. Ilman suostumusta Helsinki-profiilia ei voida luoda,
        eivätkä palvelut voi käyttää tietojasi.{' '}
      </p>

      <p>
        6-numeroisen varmistuskoodin syöttämisen jälkeen täytä nimitietosi, anna
        salasana sekä suostumus tietojesi käyttöön. Salasanassa pitää olla
        vähintään 12 merkkiä, pieniä ja isoja kirjaimia, numeroita sekä
        erikoismerkkejä.
      </p>

      <p>
        <img
          width={215}
          height={403}
          src={image010}
          alt="Helsink-profiilin luomisen yhteydessä pitää vielä täyttää nimitiedot ja antaa salasana. &#10;Sinun pitää myös antaa suostumus tietojesi käyttöön, jotta Helsinki-profiili voidaan luoda."
        />
      </p>

      <p>
        Nyt sinulle on luotu Helsinki-profiili. Palveluihin tunnistautumiseen
        tarvitsemasi Helsinki-tunnus on tämä
        sähköpostiosoite-salasana-yhdistelmä.
      </p>

      <h2 id="_Eri_tunnistautumistapojen_yhdistämi">
        Tunnistautumistapojen yhdistäminen
      </h2>

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
        sisäänkirjautumisnäkymässä voi klikata <i>Olen unohtanut salasanani</i>{' '}
        -linkkiä. Tästä ohjeet seuraavassa osiossa{' '}
        <a href="#_Unohtunut_salasana">Unohtunut salasana</a>.
      </p>

      <h2 id="_Salasanan_unohtaminen">Unohtunut salasana</h2>

      <p>
        Jos et muista salasanaasi, voit luoda uuden kirjautumisikkunassa
        <i>Olen unohtanut salasanani</i> -linkistä. Salasanan ”unohtuminen” voi
        myös johtua siitä, että olet aiemmilla kerroilla kirjautunut palveluun
        suomi.fi-tunnistautuen, jolloin salasanaa ei ole tarvittu.
        <img
          width={327}
          height={490}
          src={image011}
          alt="Klikkaa kirjautumisikkunassa Olen unohtanut salasanani -linkkiä."
        />
      </p>

      <p>
        <img
          width={322}
          height={359}
          src={image012}
          alt="Syötä sähköpostiosoitteesi avautuvaan kenttään, jotta saat salasanan uusimislinkin sähköpostiisi."
        />
      </p>

      <p>
        <img
          width={284}
          height={505}
          src={image013}
          alt="Saat tiedon, että sinulle lähetetään sähköpostiviesti salasanan uusimista varten."
        />
      </p>

      <p>
        Sähköpostin antamisen jälkeen saat sähköpostiisi linkin uuden salasanan
        antamiseen. Linkki on voimassa 30 minuuttia.
      </p>

      <p>
        <img
          width={482}
          height={285}
          src={image014}
          alt="Saamassasi sähköpostiviestissä on linkki uuden salasanan antamista varten. Linkki on voimassa 30 minuuttia. "
        />
      </p>

      <p>
        Salasanan pitää olla vähintään 12 merkkiä pitkä. Siinä pitää käyttää
        sekä isoja että pieniä kirjaimia, numeroita ja erikoismerkkejä.
      </p>

      <p>
        <img
          width={323}
          height={331}
          src={image015}
          alt="Salasanan vaihtoikkunassa sinun pitää syöttää sama salasana kahteen kertaan. Salasanassa pitää olla vähintään 12 merkkiä. Salasanan pitää sisältää sekä isoja että pieniä kirjaimia, numeroita ja erikoismerkkejä."
        />
      </p>

      <h2 id="_Ongelma_kirjautumisessa">Ongelma tunnistautumisessa</h2>

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
        <img
          width={435}
          height={435}
          src={image016}
          alt="Yhteensopimaton kirjautumistapa tarkoittaa, että olet kirjautunut esimerkiksi yhteen palveluun sähköposti-salasana-yhdistelmällä ja siirryt käyttämään seuraavaa palvelua, joka tarvitseekin suomi.fi-tunnistautumisen. Tällöin sinun pitää kirjautua ulos ensimmäisestä palvelusta voidaksesi kirjautua uuteen palveluun."
        />
      </p>

      <p>
        <img
          width={433}
          height={345}
          src={image017}
          alt="Vahvista uloskirjautuminen aiemmasta palvelusta."
        />
      </p>

      <h2 id="_Omien_tietojen_katselu">
        Omien tietojen katselu ja muokkaaminen
      </h2>

      <p>
        Kirjautumalla Helsinki-profiiliin osoitteessa{' '}
        <a href="https://profiili.hel.fi">https://profiili.hel.fi</a> voit
        katsella ja muokata omia tietojasi ja miten palvelut niitä käyttävät:
      </p>

      <p>Voit lisätä puhelinnumeron.</p>

      <p>Vaihtaa sähköpostiosoitteen.</p>

      <p>Lisätä osoitetiedot.</p>

      <p>
        Viralliset tiedot tulevat profiiliin ja näkyvät vain
        suomi.fi-tunnistautuen. Näiden tietojen päivittäminen tehdään
        väestörekisterikeskuksen palvelussa.{' '}
      </p>

      <p>
        Jos päivität nimitietosi Helsinki-profiilissa, niin seuraavalla
        suomi.fi-tunnistautumiskerralla viralliset tiedot päivittävät ne.{' '}
        <img
          width={482}
          height={328}
          src={image018}
          alt="Helsinki-profiilissa Omat tiedot -osiossa Viralliset tiedot tulevat suoraan väestörekisterikeskuksesta ja niiden päivittäminen tehdään myös siellä."
        />
      </p>

      <p>
        <img
          width={482}
          height={289}
          src={image019}
          alt="Helsinki-profiilissa Omat tiedot -osiossa Perustiedot ovat itse päivitettävissä."
        />
      </p>

      <p>
        Voit lisätä tai muuttaa itse syöttämiäsi tietoja Lisää-painikkeella tai
        Muokkaa-painikkeella, jos tiedot ovat jo olemassa. Tallenna-painiketta
        painamalla tiedot tallentuvat tietokantaan.{' '}
      </p>

      <p>
        <img
          width={482}
          height={327}
          src={image020}
          alt="Voit lisätä ja muokata muita osoitetietojasi, puhelinnumerosi ja sähköpostiosoitteesi."
        />
      </p>

      <p>
        Helsinki-profiilissa asiointikieli-kohta määrittää, millä kielellä
        esimerkiksi palvelun sähköpostit tulevat.{' '}
      </p>

      <p>
        <img
          width={482}
          height={116}
          src={image021}
          alt="Asiointikieli määrittää, millä kielellä saat viestejä palvelusta."
        />
      </p>

      <p>
        Näet myös miten olet tunnistautunut Helsinki-profiiliin.
        <img
          width={482}
          height={76}
          src={image022}
          alt="Helsinki-profiilin Omat tiedot -välilehdellä Tunnistautumistapa kertoo, millä tavalla olet kirjautunut palveluun eli suomi.fi-tunnistautuminen tai sähköposti-salasana-yhdistelmällä eli Helsinki-tunnuksella."
        />
      </p>

      <h2 id="_Tietojesi_käsittely_eri">Tietojesi käsittely eri palveluissa</h2>

      <p>
        Palvelut hyödyntävät Helsinki-profiilin hallinnoimia tietoja
        ilmoittamallaan tavalla. Tunnistautumalla ensimmäisen kerran palveluun,
        näet mitä tietoja palvelu hyödyntää.
      </p>

      <p>
        <img
          width={435}
          height={463}
          src={image023}
          alt="Tunnistautuessasi uuteen palveluun sinulta pyydetään suostumus palvelun tarvitsemien tietojesi käyttöön. &#10;Voit myöhemmin palata näihin tietoihin Helsinki-profiilin Käyttämäsi palvelut -välilehdellä."
        />
      </p>

      <p>
        Helsinki-profiilissa voit tarkistaa myöhemmin nämä tiedot sekä
        halutessasi poistaa tietosi palvelusta. Poisto ei ole mahdollista, jos
        asiointi on kesken palvelussa. On myös suositeltavaa{' '}
        <a href="#_Tietojen_lataaminen">ladata omat tiedot talteen</a> ennen
        poistoa.
      </p>

      <p>
        <img
          width={482}
          height={455}
          src={image024}
          alt="Helsinki-profiilin Käyttämäsi palvelut -osiossa näet kaikki palvelut, joihin olet tunnistautunut ja mitä tietojasi ne käyttävät. &#10;Voit myös poistaa tietosi yksittäisistä palveluista."
        />
      </p>

      <h2 id="_Tietojen_lataaminen">Tietojesi lataaminen</h2>

      <p>
        Voit myös ladata eri palveluihin tallentamasi tiedot yhtenä
        json-tiedostona. Lisää tietoa{' '}
        <a href="https://fi.wikipedia.org/wiki/JSON">
          json-tiedostomuodosta Wikipediassa (linkki avautuu uuteen ikkunaan)
        </a>
        .<br />
        Jos olet yhdistänyt suomi.fi-tunnistautumisen ja
        sähköpostiosoite+salasana-kirjautumisen samaan Helsinki-profiiliin,
        tietojen lataus pitää tehdä suomi.fi-tunnistautuneena.
        <br />
        <img
          width={482}
          height={107}
          src={image025}
          alt="Helsinki-profiilin Omat tiedot -osiossa voit ladata tietosi kaikista palveluista json-tiedostona."
        />
      </p>

      <h2 id="_Tietojen_poisto">
        Tietojesi poisto yksittäisestä palvelusta tai koko Helsinki-profiilista
      </h2>

      <p>
        Voit poistaa tietosi joko yksittäisistä palveluista tai koko profiilin.
        Poiston myötä kaikki tietosi palvelusta poistetaan tai anonymisoidaan,
        jos palvelu esim. lakisääteisenä joutuu niitä säilyttämään. Sinulla ei
        kuitenkaan ole poiston jälkeen pääsyä tietoihin, eikä niitä ole
        yhdistettävissä sinuun.{' '}
      </p>

      <p>
        Jos olet yhdistänyt suomi.fi-tunnistautumisen ja
        sähköpostiosoite+salasana-kirjautumisen samaan Helsinki-profiiliin,
        palvelun poistaminen pitää tehdä suomi.fi-tunnistautuneena.
      </p>

      <p>
        <img
          width={482}
          height={240}
          src={image026}
          alt="Voit poistaa tietosi Helsinki-profiilissa yksittäisen palvelun kohdalla Käyttämäsi palvelut -osiossa."
        />
      </p>

      <p>
        Kun valitset poistettavan palvelun Käyttämäsi palvelut -välilehdellä,
        saat pop-up-ikkunaan vahvistusviestin poistosta.{' '}
      </p>

      <p>
        <img
          width={482}
          height={239}
          src={image027}
          alt='Klikattuasi "Poista tietosi tästä palvelusta"-painiketta saat vielä pop-up-vahvistusviestin ruudulle, jotta tietoja ei poisteta vahingossa.'
        />
      </p>

      <p>
        <img
          width={421}
          height={193}
          src={image028}
          alt="Saat ruudulle vielä vahvistusviestin, että tiedot on poistettu kyseisestä palvelusta."
        />
      </p>

      <p>
        Jos haluat poistaa koko Helsinki-profiilin, voit tehdä sen Poista omat
        tiedot -näppäintä painamalla. Tämän jälkeen ruudulle tulee
        pop-up-ikkuna, jossa vielä varmistetaan, että haluat poistaa tietosi.
        Vahvistamalla pyynnön kaikki tiedot poistetaan profiilista sekä kaikista
        asiointipalveluista, jos mitään asiointia ei ole kesken.
      </p>

      <p>
        Jotkin lakisääteiset asiointipalvelut voivat edellyttää tietojen
        säilyttämistä määräajan tai pysyvästi. Asioinnista ja asiointipalvelusta
        riippuen tiedot voidaan anonymisoida joissakin tapauksissa. Jos
        lakisääteisen palvelun pitää säilyttää tiedot, tällöin profiilia tai
        kyseisen palvelun käyttöoikeutta tietoihin ei voida poistaa.
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
        <img
          width={482}
          height={146}
          src={image029}
          alt="Helsinki-profiilin Omat tiedot -osiossa on painike Poista omat tiedot, jolla voit poistaa koko Helsinki-profiilin ja eri palveluissa käytetyt tietosi."
        />
      </p>

      <p>
        <img
          width={391}
          height={173}
          src={image030}
          alt="Ruudulle tulee vielä varmistusviesti pop-up-ikkunaan, jotta tietoja ei poisteta vahingossa."
        />
      </p>
    </Fragment>
  );
}

export default UserGuideFi;
