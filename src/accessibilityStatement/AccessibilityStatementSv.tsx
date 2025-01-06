import React, { Fragment } from 'react';

import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function AccessibilityStatementSv(): React.ReactElement {
  return (
    <Fragment>
      <FocusableH1>Tillgänglighets­utlåtande</FocusableH1>
      <p>
        Detta tillgänglighetsutlåtande gäller webbservicen Helsingfors profil
        (https//profiili.hel.fi). Helsingfors stad har ansvar för webbservicen.
        Detta utlåtande beskriver hur tillgänglig webbservicen är och hur du kan
        ge oss respons om dess tillgänglighet.
      </p>

      <h2>Hur tillgänglig är denna webbservice?</h2>
      <p>
        Enligt lagen om tillhandahållande av digitala tjänster ska webbplatser
        för den offentliga förvaltningen vara tillgängliga, vilket betyder att
        alla ska ha lika möjligheter att använda dem.
      </p>

      <p>
        Den här webbservicen uppfyller helt och hållet de
        tillgänglighetskriterier som lagen förutsätter (WCAG-kriterierna 2.1,
        nivå A och AA).
      </p>

      <h3>Utvärdering av tillgängligheten</h3>

      <p>
        I utvärderingen av tillgängligheten har man följt Helsingfors stads
        arbetsordning och metoder som syftar till att säkerställa tjänstens
        tillgänglighet i alla arbetsmoment.
      </p>
      <p>
        Tillgängligheten har kontrollerats genom utvärdering av en utomstående
        sakkunnig samt genom självvärdering. Tillgängligheten har kontrollerats
        med hjälp av automatisk tillgänglighetskontroll samt manuell kontroll av
        webbservicen och dess innehåll.
      </p>
      <p>
        De brister som identifierades i tillgänglighetsgranskningen har
        åtgärdats senast 21.05.2024.
      </p>
      <p>Den externa expertgranskningen har utförts av Unicus Oy.</p>

      <h2>Har du upptäckt brister i tillgängligheten?</h2>
      <p>
        Vi försöker hela tiden förbättra webbservicens tillgänglighet. Ta
        kontakt med oss om du upptäcker brister i tillgängligheten som inte har
        beskrivits på den här sidan eller om innehållet du behöver inte är
        tillgängligt.
        <Link href="https://palautteet.hel.fi/sv/" external openInNewTab>
          Ge respons med den här responsblanketten.
        </Link>
      </p>

      <h2>Tillgänglighetstillsyn</h2>
      <p>
        Regionförvaltningsverket i Södra Finland övervakar att
        tillgänglighetskraven följs. Om du är missnöjd med svaret eller om du
        inte fått något svar inom två veckor, kan du göra en anmälan till
        Regionförvaltningsverket i Södra Finland. Regionförvaltningsverket i
        Södra Finland meddelar detaljerat på sin webbplats hur man går till väga
        för att lämna in en anmälan och hur den handläggs.
      </p>
      <p>
        Transport- och kommunikationsverket Traficom
        <br />
        Enheten för tillsyn över digital tillgänglighet
        <br /> E-post:{' '}
        <a href="mailto:tillganglighet@traficom.fi">
          tillganglighet@traficom.fi
        </a>
        <br />
        Telefonnummer (växeln): <a href="tel:029 534 5000">029 534 5000</a>
        <br />
        <Link href="https://www.tillgänglighetskrav.fi" external openInNewTab>
          www.tillgänglighetskrav.fi
        </Link>
      </p>

      <h2>Uppgifter om tillgänglighetsutlåtandet</h2>
      <p>Webbplatsen har publicerats 30.11.2022. </p>
      <p>Utlåtandet har upprättats 20.03.2024. </p>
      <p>Utlåtandet har uppdaterats senast 21.05.2024. </p>
      <p>
        <Link
          href="https://www.finlex.fi/sv/laki/alkup/2019/20190306"
          external
          openInNewTab
        >
          Lagen om tillhandahållande av digitala tjänster (306/2019)
        </Link>
      </p>
    </Fragment>
  );
}

export default AccessibilityStatementSv;
