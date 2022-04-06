import React, { Fragment } from 'react';

import { Link } from '../common/copyOfHDSLink/Link';
import FocusableH1 from '../common/focusableH1/FocusableH1';

function AccessibilityStatementSv(): React.ReactElement {
  return (
    <Fragment>
      <FocusableH1>Tillgänglighets­utlåtande</FocusableH1>
      <p>
        Detta tillgänglighetsutlåtande gäller Helsingfors stads webbplats
        Helsingfors-profli. Webbplatsens adress är https://profiili.hel.fi.
      </p>

      <h2>Stadens mål</h2>
      <p>
        När det gäller tillgänglighet till digitala tjänster har Helsingfors
        stad som mål att uppnå minst nivå AA eller bättre enligt
        WCAG-anvisningarna, om det är rimligt.
      </p>

      <h2>Fullgörandestatus</h2>
      <p>
        Denna webbplats uppfyller de kritiska tillgänglighetskraven som lagen
        ställer.
      </p>

      <h2>Utarbetande av tillgänglighetsutlåtande</h2>
      <p>Detta utlåtande upprättades den 5 april 2022.</p>

      <h3>Bedömning av tillgänglighet</h3>
      <p>
        Vid bedömning av tillgänglighet har vi följt Helsingfors stads
        arbetsanvisning och metoder som strävar efter att säkerställa
        webbplatsens tillgänglighet i alla arbetsfaser.
      </p>
      <p>
        Tillgängligheten är kontrollerad genom revision av en extern expert samt
        genom egen utvärdering.
      </p>
      <p>
        Tillgängligheten är kontrollerad med hjälp av automatisk
        tillgänglighetskontroll samt manuell kontroll av webbplatsen och
        innehållet. Automatisk granskning av tillgängligheten har utförts med
        det automatiska testningsverktyget och webbläsartillägget Siteimprove.
      </p>
      <p>Den externa expertrevisionen har utförts av Siteimprove.</p>

      <h3>Uppdatering av tillgänglighetsutlåtande</h3>
      <p>
        Webbplatsens tillgänglighet kontrolleras genom kontinuerlig tillsyn när
        tekniken eller innehållet förändras, samt granskning med regelbundna
        intervall. Detta utlåtande uppdateras i samband med ändringar av
        webbplatsen samt granskningar av tillgänglighet.
      </p>

      <h2>Återkoppling och kontaktuppgifter</h2>
      <p>
        Stadskansliet
        <br />
        Helsingfors
      </p>

      <h3>Anmälan om ej tillgängligt innehåll</h3>
      <p>
        Om användaren upplever att kraven på tillgänglighet ändå inte uppfylls
        kan detta anmälas per e-post{' '}
        <a href="mailto:helsinki.palaute@hel.fi">helsinki.palaute@hel.fi</a>{' '}
        eller med responsformulär på{' '}
        <Link
          href="https://www.hel.fi/helsinki/sv/stad-och-forvaltning/delta/feedback"
          external
          openInNewTab
        >
          www.hel.fi/feedback
        </Link>
        .
      </p>

      <h3>Begäran om uppgifter i tillgänglig form</h3>
      <p>
        Om användaren inte upplever sig få webbplatsens innehåll i tillgänglig
        form, kan användaren begära denna information per e-post{' '}
        <a href="mailto:helsinki.palaute@hel.fi">helsinki.palaute@hel.fi</a>{' '}
        eller med responsformulär på{' '}
        <Link
          href="https://www.hel.fi/helsinki/sv/stad-och-forvaltning/delta/feedback"
          external
          openInNewTab
        >
          www.hel.fi/feedback
        </Link>{' '}
        . Vår strävan är att svara på förfrågan inom rimlig tid.
      </p>

      <h2>Rättsskydd för tillgänglighet, Verkställighetsförfarande</h2>
      <p>
        Om en person upplever att svar inte har erhållits på hans eller hennes
        anmälan eller förfrågan, eller om svaret inte är tillfredsställande, kan
        ärendet anmälas till regionförvaltningsverket i Södra Finland. På
        webbplatsen för regionförvaltningsverket i Södra Finland finns
        detaljerad information om hur ärendet behandlas.
      </p>
      <p>
        <strong>Regionförvaltningsverket i Södra Finland</strong>
        <br />
        <br />
        Enheten för tillgänglighetstillsyn
        <br />
        <Link href="https://www.tillganglighetskrav.fi" external openInNewTab>
          www.tillganglighetskrav.fi
        </Link>
        <br />
        <a href="mailto:webbtillganglighet@rfv.fi">webbtillganglighet@rfv.fi</a>
        <br />
        Telefonväxel: <a href="tel:0295 016 000">0295 016 000</a>
        <br />
        Öppet: må-fr kl. 8.00-16.15
      </p>

      <h2>Helsingfors stad och tillgänglighet</h2>
      <p>
        Helsingfors stad har som mål att vara en tillgänglig stad för alla.
        Stadens mål är att det ska vara så lätt som möjligt för alla stadsbor
        att röra sig och verka i Helsingfors och att alla innehåll och tjänster
        ska vara tillgängliga för alla.
      </p>
      <p>
        Staden främjar tillgängligheten för digitala tjänster genom att
        förenhetliga publiceringsarbetet och ordna utbildning om tillgänglighet
        för sin personal.
      </p>
      <p>
        Tillgänglighetsnivån för webbplatser följs upp kontinuerligt när
        webbplatserna underhålls. Observerade brister hanteras omedelbart. Vår
        strävan är att genomföra nödvändiga ändringar så snabbt som möjligt.
      </p>

      <h3>Handikappade och hjälpmedelsanvändare</h3>
      <p>
        Staden erbjuder rådgivning och stöd för handikappade och
        hjälpmedelsanvändare. Stöd kan fås på de rådgivningssidor som anges på
        stadens sidor och på telefonrådgivningen.
      </p>

      <h2>Godkännande av tillgänglighetsutlåtande</h2>
      <p>Detta utlåtande godkändes den 5 april 2022</p>
      <p>
        Stadskansliet
        <br />
        Helsingfors
      </p>
    </Fragment>
  );
}

export default AccessibilityStatementSv;
