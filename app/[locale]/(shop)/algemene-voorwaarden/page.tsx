import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/config';
import { LegalLayout, type LegalSection } from '@/components/legal/legal-layout';

export const metadata = {
  title: 'Algemene voorwaarden',
  description: 'Algemene voorwaarden van AMIS Meals — bestelling, levering, herroepingsrecht en meer.',
};

const SECTIONS: LegalSection[] = [
  { id: 'toepasselijkheid', title: '1. Toepasselijkheid' },
  { id: 'aanbod', title: '2. Aanbod en bestelling' },
  { id: 'prijzen', title: '3. Prijzen en betaling' },
  { id: 'levering', title: '4. Levering' },
  { id: 'herroeping', title: '5. Herroepingsrecht' },
  { id: 'garantie', title: '6. Garantie en aansprakelijkheid' },
  { id: 'persoonsgegevens', title: '7. Persoonsgegevens' },
  { id: 'klachten', title: '8. Klachten' },
  { id: 'recht', title: '9. Toepasselijk recht' },
  { id: 'bedrijfsgegevens', title: '10. Bedrijfsgegevens' },
];

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEN = locale === 'en';

  return (
    <LegalLayout
      title={isEN ? 'Terms and conditions' : 'Algemene voorwaarden'}
      lastUpdated="1 mei 2026"
      sections={
        isEN
          ? [
              { id: 'toepasselijkheid', title: '1. Applicability' },
              { id: 'aanbod', title: '2. Offer & order' },
              { id: 'prijzen', title: '3. Prices & payment' },
              { id: 'levering', title: '4. Delivery' },
              { id: 'herroeping', title: '5. Right of withdrawal' },
              { id: 'garantie', title: '6. Warranty & liability' },
              { id: 'persoonsgegevens', title: '7. Personal data' },
              { id: 'klachten', title: '8. Complaints' },
              { id: 'recht', title: '9. Applicable law' },
              { id: 'bedrijfsgegevens', title: '10. Company details' },
            ]
          : SECTIONS
      }
    >
      {isEN ? <TermsEN /> : <TermsNL />}
    </LegalLayout>
  );
}

function TermsNL() {
  return (
    <>
      <h2 id="toepasselijkheid">1. Toepasselijkheid</h2>
      <p>
        Deze algemene voorwaarden zijn van toepassing op iedere overeenkomst tussen AMIS Meals
        (hierna: &ldquo;wij&rdquo;, &ldquo;ons&rdquo;) en de consument (hierna: &ldquo;jij&rdquo;,
        &ldquo;klant&rdquo;) die via amismeals.nl wordt gesloten. Door een bestelling te plaatsen
        accepteer je deze voorwaarden.
      </p>
      <p>
        Afwijkingen op deze voorwaarden gelden alleen wanneer wij die schriftelijk bevestigen.
      </p>

      <h2 id="aanbod">2. Aanbod en bestelling</h2>
      <p>
        Ons aanbod op amismeals.nl is vrijblijvend en kan op elk moment worden gewijzigd. Een
        overeenkomst komt tot stand zodra je je bestelling hebt afgerond en wij de
        bestelbevestiging per e-mail hebben verzonden.
      </p>
      <p>
        Wij behouden ons het recht voor bestellingen te weigeren wanneer er gegronde reden is
        (bijvoorbeeld bij vermoeden van fraude, herhaalde retourneringen of indien de gewenste
        producten niet beschikbaar zijn).
      </p>

      <h2 id="prijzen">3. Prijzen en betaling</h2>
      <p>
        Alle prijzen op de website zijn inclusief 9% BTW (laag tarief, voedingsmiddelen) tenzij
        anders aangegeven. Verzendkosten worden separaat getoond tijdens de checkout.
      </p>
      <p>
        Betaling vindt plaats via Mollie, onze betaalprovider. Wij accepteren iDEAL, creditcard,
        Klarna (achteraf betalen), Bancontact en Apple Pay (waar beschikbaar). Bij niet-tijdige
        betaling kunnen wij de bestelling annuleren.
      </p>

      <h2 id="levering">4. Levering</h2>
      <p>
        Voor postcodes binnen het Maastrichtse bezorggebied (6200-6229) verzorgen wij de levering
        zelf. Standaard bezorging vindt plaats op donderdag tussen 16:00 en 20:00. Buiten dit
        gebied bezorgen wij via PostNL, met track &amp; trace.
      </p>
      <p>
        De koudketen wordt tijdens transport gewaarborgd door geïsoleerde verpakkingen en — bij
        PostNL-zendingen — koelelementen. Na ontvangst dient de bestelling direct in een koelkast
        van maximaal 4 °C te worden bewaard.
      </p>

      <h2 id="herroeping">5. Herroepingsrecht</h2>
      <p>
        Onze maaltijden zijn verzegelde voedingsproducten die snel kunnen bederven. Op grond van
        artikel 6:230p sub f BW (uitsluiting voor bederfelijke waar) en het feit dat de
        verzegeling na levering wordt verbroken, is het wettelijke herroepingsrecht van 14 dagen
        op deze producten <strong>niet van toepassing</strong>.
      </p>
      <p>
        Bij beschadigde of niet-conforme levering kun je binnen 24 uur na ontvangst contact
        opnemen, dan zoeken we samen een passende oplossing (vervanging of terugbetaling).
      </p>

      <h2 id="garantie">6. Garantie en aansprakelijkheid</h2>
      <p>
        Wij staan ervoor in dat onze maaltijden voldoen aan de overeenkomst, de in het aanbod
        vermelde specificaties en redelijke eisen van deugdelijkheid en bruikbaarheid. Onze
        aansprakelijkheid is in alle gevallen beperkt tot het bedrag dat je voor de betreffende
        bestelling hebt betaald.
      </p>
      <p>
        Wij zijn niet aansprakelijk voor schade als gevolg van onjuist gebruik (bewaartemperatuur
        of opwarminstructies niet gevolgd), allergische reacties bij niet-gemelde allergieën, of
        overmacht.
      </p>

      <h2 id="persoonsgegevens">7. Persoonsgegevens</h2>
      <p>
        Wij verwerken jouw persoonsgegevens conform ons{' '}
        <Link href="/privacybeleid">privacybeleid</Link> en de Algemene Verordening
        Gegevensbescherming (AVG/GDPR).
      </p>

      <h2 id="klachten">8. Klachten</h2>
      <p>
        Heb je een klacht over onze producten of dienstverlening? Neem dan binnen redelijke
        termijn (in elk geval binnen 7 dagen na ontvangst) contact met ons op via{' '}
        <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a> of via de{' '}
        <Link href="/contact">contactpagina</Link>. Wij streven ernaar binnen 3 werkdagen te reageren.
      </p>
      <p>
        Komen we er samen niet uit? Dan kun je je klacht voorleggen aan de Geschillencommissie of
        gebruikmaken van het ODR-platform van de Europese Commissie.
      </p>

      <h2 id="recht">9. Toepasselijk recht</h2>
      <p>
        Op deze voorwaarden en op iedere overeenkomst tussen AMIS Meals en de klant is uitsluitend
        Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter te
        Maastricht, tenzij dwingendrechtelijke bepalingen anders voorschrijven.
      </p>

      <h2 id="bedrijfsgegevens">10. Bedrijfsgegevens</h2>
      <p>
        <strong>AMIS Meals</strong>
        <br />
        Maastricht, Nederland
        <br />
        E-mail: <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a>
        <br />
        KvK-nummer: <em>[wordt nog ingevuld]</em>
        <br />
        BTW-nummer: <em>[wordt nog ingevuld]</em>
      </p>
    </>
  );
}

function TermsEN() {
  return (
    <>
      <h2 id="toepasselijkheid">1. Applicability</h2>
      <p>
        These terms apply to every agreement between AMIS Meals (&ldquo;we&rdquo;) and the
        consumer (&ldquo;you&rdquo;) concluded via amismeals.nl. By placing an order you accept
        these terms.
      </p>

      <h2 id="aanbod">2. Offer and order</h2>
      <p>
        Our offer is non-binding and may change at any time. An agreement is formed once you have
        completed your order and we have sent the order confirmation by email.
      </p>

      <h2 id="prijzen">3. Prices and payment</h2>
      <p>
        All prices include 9% Dutch VAT (low food rate) unless stated otherwise. Shipping is
        shown separately during checkout. Payment is processed via Mollie (iDEAL, credit card,
        Klarna, Bancontact, Apple Pay).
      </p>

      <h2 id="levering">4. Delivery</h2>
      <p>
        Within the Maastricht delivery area (postal codes 6200-6229) we deliver in person on
        Thursdays between 16:00 and 20:00. Outside this area we use PostNL with track &amp;
        trace. The cold chain is preserved with insulated packaging.
      </p>

      <h2 id="herroeping">5. Right of withdrawal</h2>
      <p>
        Our meals are sealed perishable food products. Under Dutch civil law (article 6:230p sub
        f BW, exclusion for perishable goods) the statutory 14-day cooling-off period{' '}
        <strong>does not apply</strong> to these products. Damaged or non-conforming deliveries
        can be reported within 24 hours after receipt.
      </p>

      <h2 id="garantie">6. Warranty and liability</h2>
      <p>
        We warrant that our meals meet the agreement, the specifications stated in the offer and
        reasonable standards of quality. Our liability is limited to the amount paid for the
        relevant order.
      </p>

      <h2 id="persoonsgegevens">7. Personal data</h2>
      <p>
        We process your personal data in accordance with our{' '}
        <Link href="/privacybeleid">privacy policy</Link> and the GDPR.
      </p>

      <h2 id="klachten">8. Complaints</h2>
      <p>
        Please contact us within 7 days of receipt at{' '}
        <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a>. We aim to respond within 3
        working days.
      </p>

      <h2 id="recht">9. Applicable law</h2>
      <p>
        Dutch law applies exclusively to these terms. Disputes are submitted to the competent
        court in Maastricht, unless mandatory provisions stipulate otherwise.
      </p>

      <h2 id="bedrijfsgegevens">10. Company details</h2>
      <p>
        <strong>AMIS Meals</strong>
        <br />
        Maastricht, the Netherlands
        <br />
        Email: <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a>
        <br />
        Chamber of Commerce: <em>[to be filled]</em>
        <br />
        VAT: <em>[to be filled]</em>
      </p>
    </>
  );
}
