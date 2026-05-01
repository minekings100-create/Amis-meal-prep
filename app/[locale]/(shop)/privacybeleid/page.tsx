import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/config';
import { LegalLayout, type LegalSection } from '@/components/legal/legal-layout';

export const metadata = {
  title: 'Privacybeleid',
  description:
    'Hoe AMIS Meals omgaat met jouw persoonsgegevens — wat we verzamelen, waarom, en welke rechten je hebt.',
};

const SECTIONS_NL: LegalSection[] = [
  { id: 'intro', title: 'Introductie' },
  { id: 'welke-data', title: 'Welke data verzamelen we' },
  { id: 'partners', title: 'Verwerkers en partners' },
  { id: 'cookies', title: 'Cookies en tracking' },
  { id: 'bewaartermijn', title: 'Bewaartermijnen' },
  { id: 'rechten', title: 'Jouw rechten (AVG)' },
  { id: 'beveiliging', title: 'Beveiliging' },
  { id: 'wijzigingen', title: 'Wijzigingen' },
  { id: 'contact', title: 'Contact' },
];

const SECTIONS_EN: LegalSection[] = [
  { id: 'intro', title: 'Introduction' },
  { id: 'welke-data', title: 'What data we collect' },
  { id: 'partners', title: 'Processors and partners' },
  { id: 'cookies', title: 'Cookies and tracking' },
  { id: 'bewaartermijn', title: 'Retention' },
  { id: 'rechten', title: 'Your rights (GDPR)' },
  { id: 'beveiliging', title: 'Security' },
  { id: 'wijzigingen', title: 'Changes' },
  { id: 'contact', title: 'Contact' },
];

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEN = locale === 'en';

  return (
    <LegalLayout
      title={isEN ? 'Privacy policy' : 'Privacybeleid'}
      lastUpdated="1 mei 2026"
      sections={isEN ? SECTIONS_EN : SECTIONS_NL}
    >
      {isEN ? <PrivacyEN /> : <PrivacyNL />}
    </LegalLayout>
  );
}

function PrivacyNL() {
  return (
    <>
      <h2 id="intro">Introductie</h2>
      <p>
        AMIS Meals (gevestigd te Maastricht) hecht waarde aan de bescherming van jouw
        persoonsgegevens. In dit privacybeleid leggen we uit welke gegevens we verzamelen, waarom,
        hoe lang we ze bewaren en welke rechten je hebt onder de Algemene Verordening
        Gegevensbescherming (AVG/GDPR).
      </p>
      <p>
        Verwerkingsverantwoordelijke is AMIS Meals, bereikbaar via{' '}
        <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a>.
      </p>

      <h2 id="welke-data">Welke data verzamelen we</h2>
      <h3>Account- en bestelgegevens</h3>
      <ul>
        <li>Naam, e-mailadres, telefoonnummer</li>
        <li>Bezorg- en factuuradres</li>
        <li>Bestelhistorie (producten, bedragen, datums)</li>
        <li>Klant-opmerkingen bij bestellingen (allergie-info, bezorgvoorkeuren)</li>
      </ul>
      <h3>Betaalgegevens</h3>
      <p>
        Betalingen verlopen via <strong>Mollie B.V.</strong>. Wij ontvangen geen volledige
        creditcardgegevens; we slaan alleen het Mollie-betalings-ID en de status op zodat we de
        bestelling aan een betaling kunnen koppelen.
      </p>
      <h3>Verzendgegevens</h3>
      <p>
        Voor PostNL-zendingen delen we naam, adres, telefoonnummer en e-mailadres met{' '}
        <strong>Sendcloud B.V.</strong>, die het label genereert en het transport coördineert.
      </p>
      <h3>Communicatie</h3>
      <p>
        Transactionele e-mails (bevestiging, verzendupdates) worden verstuurd via{' '}
        <strong>Resend Inc.</strong>. Newsletter-aanmeldingen worden alleen verstuurd na expliciete
        opt-in.
      </p>

      <h2 id="partners">Verwerkers en partners</h2>
      <ul>
        <li>
          <strong>Supabase Inc.</strong> — database hosting (EU-regio), authentication.
        </li>
        <li>
          <strong>Vercel Inc.</strong> — website hosting, CDN, edge functions.
        </li>
        <li>
          <strong>Mollie B.V.</strong> — betalingsverwerking.
        </li>
        <li>
          <strong>Sendcloud B.V.</strong> — verzendlabels en track &amp; trace.
        </li>
        <li>
          <strong>Resend Inc.</strong> — transactionele e-mail.
        </li>
      </ul>
      <p>
        Met al deze partijen hebben wij een verwerkersovereenkomst (DPA). Data buiten de EU wordt
        alleen verwerkt onder geldige doorgiftemechanismen (Standard Contractual Clauses).
      </p>

      <h2 id="cookies">Cookies en tracking</h2>
      <p>
        Wij gebruiken alleen <strong>essentiële cookies</strong> voor je winkelmand, sessie en
        taalvoorkeur. Met jouw toestemming gebruiken we eventueel{' '}
        <strong>analytics cookies</strong> (anonieme bezoekstatistieken). Geen advertenties of
        tracking door derden.
      </p>
      <p>
        Je kunt je voorkeuren op elk moment wijzigen via de link &ldquo;Cookie-instellingen&rdquo;
        in de footer.
      </p>

      <h2 id="bewaartermijn">Bewaartermijnen</h2>
      <ul>
        <li>Account-gegevens: zolang je account actief is + 12 maanden.</li>
        <li>Bestelgegevens: 7 jaar (fiscale bewaarplicht).</li>
        <li>Customer support e-mails: 24 maanden.</li>
        <li>Newsletter-data: tot uitschrijving.</li>
      </ul>

      <h2 id="rechten">Jouw rechten (AVG)</h2>
      <p>Onder de AVG/GDPR heb je het recht om:</p>
      <ul>
        <li>Inzage te krijgen in je persoonsgegevens.</li>
        <li>Onjuiste gegevens te laten rectificeren.</li>
        <li>Gegevens te laten verwijderen (&ldquo;recht om vergeten te worden&rdquo;).</li>
        <li>Verwerking te beperken of bezwaar te maken.</li>
        <li>Je gegevens over te dragen (data-portability).</li>
        <li>
          Een klacht in te dienen bij de Autoriteit Persoonsgegevens (
          <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">
            autoriteitpersoonsgegevens.nl
          </a>
          ).
        </li>
      </ul>
      <p>
        Voor verzoeken kun je mailen naar <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a>.
        We reageren binnen 30 dagen.
      </p>

      <h2 id="beveiliging">Beveiliging</h2>
      <p>
        Wij beveiligen jouw gegevens met passende technische en organisatorische maatregelen:
        TLS-versleuteling, gehashte wachtwoorden, toegangsrechten op basis van rollen, en regelmatige
        review van wie toegang heeft tot wat.
      </p>

      <h2 id="wijzigingen">Wijzigingen</h2>
      <p>
        Wij kunnen dit beleid aanpassen. Ingrijpende wijzigingen worden via de website
        gecommuniceerd. De datum bovenaan dit document toont de laatste wijziging.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Vragen of opmerkingen? Mail{' '}
        <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a> of gebruik de{' '}
        <Link href="/contact">contactpagina</Link>.
      </p>
    </>
  );
}

function PrivacyEN() {
  return (
    <>
      <h2 id="intro">Introduction</h2>
      <p>
        AMIS Meals (Maastricht) takes your personal data seriously. This policy explains what we
        collect, why, how long we retain it and what rights you have under the General Data
        Protection Regulation (GDPR).
      </p>
      <p>
        Data controller: AMIS Meals, reachable at{' '}
        <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a>.
      </p>

      <h2 id="welke-data">What data we collect</h2>
      <p>
        Account &amp; order data (name, email, phone, address, order history), payment metadata
        via Mollie, shipping data shared with Sendcloud, transactional emails sent via Resend.
      </p>

      <h2 id="partners">Processors and partners</h2>
      <ul>
        <li>Supabase Inc. — database + auth (EU region)</li>
        <li>Vercel Inc. — website hosting</li>
        <li>Mollie B.V. — payment processing</li>
        <li>Sendcloud B.V. — shipping labels</li>
        <li>Resend Inc. — transactional email</li>
      </ul>

      <h2 id="cookies">Cookies and tracking</h2>
      <p>
        Essential cookies only by default (cart, session, language). Optional analytics cookies
        require explicit consent. No third-party advertising or cross-site tracking.
      </p>

      <h2 id="bewaartermijn">Retention</h2>
      <p>
        Account data: while account is active + 12 months. Order data: 7 years (Dutch tax
        retention). Support emails: 24 months. Newsletter data: until unsubscribe.
      </p>

      <h2 id="rechten">Your rights (GDPR)</h2>
      <p>
        Right to access, rectify, erase, restrict processing, object, and data portability.
        Complaints can be filed with the Dutch DPA (Autoriteit Persoonsgegevens).
      </p>

      <h2 id="beveiliging">Security</h2>
      <p>TLS encryption, hashed passwords, role-based access, regular access review.</p>

      <h2 id="wijzigingen">Changes</h2>
      <p>
        Material changes will be communicated on the website. The date at the top reflects the
        last update.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Email <a href="mailto:hallo@amismeals.nl">hallo@amismeals.nl</a>.
      </p>
    </>
  );
}
