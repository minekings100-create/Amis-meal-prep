'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FaqItem {
  q: string;
  a: string;
}
interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

const NL: FaqCategory[] = [
  {
    id: 'bestellen',
    title: 'Bestellen',
    items: [
      {
        q: 'Hoe plaats ik een bestelling?',
        a: 'Kies losse maaltijden of een pakket via de shop, voeg toe aan je winkelmand en doorloop de checkout in 3 stappen: bezorggegevens, verzending, betaling. Je ontvangt direct een bevestiging per e-mail.',
      },
      {
        q: 'Kan ik mijn bestelling nog wijzigen of annuleren?',
        a: 'Wijzigen kan tot 24 uur vóór de geplande verzenddag — neem contact op via hallo@amismeals.nl. Daarna staat de productie al gepland en is wijzigen helaas niet meer mogelijk.',
      },
      {
        q: 'Is er een minimum bestelwaarde?',
        a: 'Nee, je kunt vanaf één losse maaltijd bestellen. Verzendkosten zijn gratis vanaf €40 (lokaal Maastricht) of €60 (PostNL).',
      },
    ],
  },
  {
    id: 'bezorging',
    title: 'Bezorging',
    items: [
      {
        q: 'Wat is het verschil tussen lokaal en PostNL?',
        a: 'Lokaal bezorgen we zelf in Maastricht (postcodes 6200-6229), op donderdagavond tussen 16:00 en 20:00. Daarbuiten verzenden we via PostNL met track & trace, levering binnen 1-2 werkdagen.',
      },
      {
        q: 'Wanneer wordt mijn bestelling bezorgd?',
        a: 'Lokaal: donderdag tussen 16:00 en 20:00. PostNL: 1-2 werkdagen na verzending. Je krijgt voor elke zending een verzendbevestiging met track & trace.',
      },
      {
        q: 'Wat tijdens vakanties?',
        a: 'Schoolvakanties beïnvloeden ons productie- en bezorgschema niet. Tijdens nationale feestdagen kan een extra dag vertraging optreden — we communiceren dit altijd vooraf via de bestelbevestiging.',
      },
      {
        q: 'Hoe blijft de koudketen gewaarborgd tijdens transport?',
        a: 'Maaltijden worden verpakt in geïsoleerde dozen met koelelementen voor PostNL-zendingen. Bij lokaal-bezorgen rijden we direct gekoeld vanaf de keuken naar jou.',
      },
    ],
  },
  {
    id: 'maaltijden',
    title: 'Maaltijden',
    items: [
      {
        q: 'Hoe vers zijn de maaltijden?',
        a: 'We bereiden alle maaltijden vers op de productiedag (donderdag) of een dag ervoor. Niet ingevroren — gewoon vers, gekoeld geleverd, klaar om binnen 5 dagen op te eten.',
      },
      {
        q: 'Hoe lang zijn de maaltijden houdbaar?',
        a: 'Tot 5 dagen na bereiding, mits gekoeld bewaard op maximaal 4 °C. De houdbaarheidsdatum staat op elke maaltijd vermeld.',
      },
      {
        q: 'Hoe warm ik een maaltijd op?',
        a: 'Magnetron op 800-900W gedurende 2-3 minuten (deksel half open). Pan op middelhoog vuur 5-6 minuten met een scheutje water. De oven kan ook: 180 °C gedurende 12-15 minuten.',
      },
      {
        q: 'Welke allergenen worden vermeld?',
        a: 'We vermelden alle 13 wettelijk verplichte allergenen per maaltijd op de productpagina: gluten, lactose, noten, eieren, soja, vis, schaaldieren, sesam, selderij, mosterd, lupine, sulfiet en weekdieren.',
      },
    ],
  },
  {
    id: 'betaling',
    title: 'Betaling',
    items: [
      {
        q: 'Welke betaalmethodes accepteren jullie?',
        a: 'iDEAL, creditcard (Visa, Mastercard, Amex), Klarna (achteraf binnen 14 dagen), Bancontact en Apple Pay (waar beschikbaar). Alles via Mollie, onze veilige betaalprovider.',
      },
      {
        q: 'Kan ik achteraf betalen?',
        a: 'Ja, via Klarna kun je tot 14 dagen na bezorging betalen. Klarna voert daarvoor een lichte kredietcheck uit.',
      },
      {
        q: 'Hoe verloopt een refund?',
        a: 'Refunds verlopen via Mollie en duren 1-5 werkdagen om op je rekening te verschijnen. Voor een refund-aanvraag mail hallo@amismeals.nl met je ordernummer.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    items: [
      {
        q: 'Moet ik een account aanmaken om te bestellen?',
        a: 'Nee, je kan ook als gast afrekenen. Een account is wel handig voor sneller afrekenen, bestelhistorie en track & trace zonder dat je je e-mail moet opzoeken.',
      },
      {
        q: 'Ik ben mijn wachtwoord vergeten — wat nu?',
        a: 'Op de inlogpagina vind je een "Wachtwoord vergeten?" link. Vul je e-mailadres in en je krijgt binnen een minuut een reset-link.',
      },
      {
        q: 'Hoe wijzig ik mijn voorkeuren of bezorgadres?',
        a: 'Log in en ga naar Profiel of Adressen. Daar kan je alles aanpassen.',
      },
    ],
  },
  {
    id: 'voeding',
    title: 'Voeding',
    items: [
      {
        q: 'Wat betekenen de doel-categorieën (Cut / Bulk / Performance)?',
        a: 'Cut-maaltijden zijn lager in calorieën, hoog in eiwit, voor mensen die afvallen. Bulk is calorierijker met complexe koolhydraten. Performance is afgestemd op herstel en presteren op trainingsdagen. Onderhoud zit ertussenin, Hybrid is flexibel.',
      },
      {
        q: 'Welke macros vermelden jullie per maaltijd?',
        a: 'Per portie tonen we calorieën, eiwit, koolhydraten, vet, vezels en zout. Allemaal in grammen, op de productpagina.',
      },
      {
        q: 'Hebben jullie ook vegetarische, glutenvrije of lactosevrije opties?',
        a: 'Ja — filter in de shop op deze attribuut-tags. We bieden meerdere vegetarische opties, sommige glutenvrij of lactosevrij. Allergie-info staat altijd duidelijk vermeld.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    items: [
      {
        q: 'Hoe dien ik een klacht in?',
        a: 'Mail binnen 7 dagen na ontvangst naar hallo@amismeals.nl met je ordernummer en een beschrijving. We reageren binnen 3 werkdagen.',
      },
      {
        q: 'Iets is mis met mijn bezorging — wat moet ik doen?',
        a: 'Bel ons direct of stuur een mail met foto. Bij beschadigde of niet-conforme levering vragen we een melding binnen 24 uur na ontvangst.',
      },
      {
        q: 'Wat is de gemiddelde response-tijd op e-mails?',
        a: 'Werkdagen: binnen 3 werkdagen. Voor urgente zaken (bezorging, allergiegerelateerd) reageren we vaak dezelfde dag.',
      },
    ],
  },
];

const EN: FaqCategory[] = [
  {
    id: 'bestellen',
    title: 'Ordering',
    items: [
      { q: 'How do I place an order?', a: 'Pick meals or a package via the shop, add to cart, and complete the 3-step checkout: details, shipping, payment. You receive a confirmation email immediately.' },
      { q: 'Can I still change or cancel my order?', a: 'Changes are possible up to 24 hours before the planned shipping day — email hallo@amismeals.nl. After that production is scheduled.' },
      { q: 'Is there a minimum order value?', a: 'No, you can order from one meal up. Free shipping above €40 (Maastricht local) or €60 (PostNL).' },
    ],
  },
  {
    id: 'bezorging',
    title: 'Delivery',
    items: [
      { q: 'Local vs. PostNL — what is the difference?', a: 'We deliver locally in Maastricht (6200-6229) on Thursdays 16:00-20:00. Outside that area we use PostNL with track & trace, 1-2 working days.' },
      { q: 'When is my order delivered?', a: 'Local: Thursday 16:00-20:00. PostNL: 1-2 working days after dispatch. You receive a shipping confirmation with tracking.' },
      { q: 'How is the cold chain preserved during transit?', a: 'Insulated boxes with cooling elements for PostNL. Local delivery is straight from our refrigerated kitchen to you.' },
    ],
  },
  {
    id: 'maaltijden',
    title: 'Meals',
    items: [
      { q: 'How fresh are the meals?', a: 'Cooked the day of (or before) shipping. Never frozen. Delivered chilled, ready to eat within 5 days.' },
      { q: 'How long are the meals usable?', a: 'Up to 5 days when stored at max 4 °C. Best-by date is printed on every meal.' },
      { q: 'How do I reheat?', a: 'Microwave 800-900W for 2-3 min (lid ajar) · pan on medium 5-6 min with a splash of water · oven 180 °C for 12-15 min.' },
      { q: 'Which allergens are listed?', a: 'All 13 EU mandatory allergens per meal on the product page: gluten, lactose, nuts, eggs, soy, fish, shellfish, sesame, celery, mustard, lupin, sulphite, molluscs.' },
    ],
  },
  {
    id: 'betaling',
    title: 'Payment',
    items: [
      { q: 'Which payment methods do you accept?', a: 'iDEAL, credit card (Visa, Mastercard, Amex), Klarna (pay later within 14 days), Bancontact, Apple Pay where available. All via Mollie.' },
      { q: 'Can I pay later?', a: 'Yes — Klarna lets you pay up to 14 days after delivery, with a soft credit check.' },
      { q: 'How does a refund work?', a: 'Refunds via Mollie take 1-5 working days to land. Email hallo@amismeals.nl with your order number to request one.' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    items: [
      { q: 'Do I need an account to order?', a: 'No, guest checkout works. An account speeds up future orders and gives you instant access to history & tracking.' },
      { q: 'Forgot password?', a: 'Use the "Forgot password?" link on the login page — reset link arrives within a minute.' },
      { q: 'How do I update my preferences or address?', a: 'Sign in and go to Profile or Addresses.' },
    ],
  },
  {
    id: 'voeding',
    title: 'Nutrition',
    items: [
      { q: 'What do Cut / Bulk / Performance mean?', a: 'Cut = lower calories, high protein for fat loss. Bulk = higher calories with complex carbs. Performance = tuned for recovery and training days. Maintenance = balanced. Hybrid = flexible.' },
      { q: 'Which macros do you list per meal?', a: 'Per portion: kcal, protein, carbs, fat, fiber, salt — all in grams, on the product page.' },
      { q: 'Vegetarian / gluten-free / lactose-free options?', a: 'Yes — filter in the shop by attribute tags. Allergens are clearly listed.' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    items: [
      { q: 'How do I file a complaint?', a: 'Email hallo@amismeals.nl within 7 days of delivery with your order number and a description. We reply within 3 working days.' },
      { q: 'Something is wrong with my delivery — what do I do?', a: 'Email or call us with a photo. Damaged or non-conforming deliveries: report within 24 hours of receipt.' },
      { q: 'Average email response time?', a: 'Working days: within 3 days. For urgent (delivery, allergy) issues we usually reply same day.' },
    ],
  },
];

export function FaqClient({ locale }: { locale: 'nl' | 'en' }) {
  const data = locale === 'en' ? EN : NL;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [data, search]);

  return (
    <div className="container-amis py-12 md:py-20 max-w-6xl">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.035em]">
          {locale === 'en' ? 'Frequently asked questions' : 'Veelgestelde vragen'}
        </h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          {locale === 'en'
            ? 'Find quick answers below. Still stuck? Reach out via '
            : 'Snelle antwoorden hieronder. Kom je er niet uit? Mail '}
          <a href="mailto:hallo@amismeals.nl" className="text-(--color-accent) hover:underline">
            hallo@amismeals.nl
          </a>
          .
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
              {locale === 'en' ? 'Topics' : 'Categorieën'}
            </p>
            {data.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="block text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                {cat.title}
              </a>
            ))}
          </nav>
        </aside>

        <div>
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === 'en' ? 'Search the FAQ…' : 'Zoek in de FAQ…'}
              className="h-12 w-full pl-11 pr-4 rounded-2xl border border-stone-200 bg-white text-sm focus:outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-bright)/30"
            />
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-stone-500 py-12 text-center">
              {locale === 'en' ? 'No results.' : 'Geen resultaten.'}
            </p>
          )}

          {filtered.map((cat) => (
            <section key={cat.id} id={cat.id} className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-[-0.02em] mb-4">{cat.title}</h2>
              <ul className="space-y-2">
                {cat.items.map((it, i) => (
                  <FaqRow key={i} q={it.q} a={it.a} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="font-medium text-stone-900">{q}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-stone-500 shrink-0 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-stone-700 leading-relaxed border-t border-stone-100 pt-3">
          {a}
        </div>
      )}
    </li>
  );
}
