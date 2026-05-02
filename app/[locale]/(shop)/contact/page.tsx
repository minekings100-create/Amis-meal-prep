import { Mail, MapPin, MessageSquare, ArrowRight } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/config';

export const metadata = {
  title: 'Contact',
  description:
    'Vragen, klachten of een team-bestelling? Neem contact op met AMIS Meals via mail of via de shop.',
};

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEN = locale === 'en';

  return (
    <div className="relative">
      {/* Brand backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-(--color-brand-yellow-bright)/8 blur-3xl"
      />

      <div className="container-amis relative py-16 md:py-24 max-w-3xl">
        <header className="mb-10 md:mb-14">
          <p className="text-[10px] uppercase tracking-[0.24em] text-(--color-brand-yellow) mb-3 font-semibold">
            {isEN ? 'Contact' : 'Contact'}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.035em]">
            {isEN ? 'Want to chat?' : 'Liever even sparren?'}
          </h1>
          <p className="text-stone-600 mt-4 text-base md:text-lg max-w-xl">
            {isEN
              ? 'Questions about ingredients, an order, or a team-sized request? Send us a line — we usually reply within 3 working days.'
              : 'Vragen over ingrediënten, een bestelling of een grote team-order? Schrijf ons even — we reageren meestal binnen 3 werkdagen.'}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ContactCard
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            primary={
              <a
                href="mailto:hallo@amismeals.nl"
                className="font-mono text-(--color-brand-yellow) hover:underline"
              >
                hallo@amismeals.nl
              </a>
            }
            sub={isEN ? 'Antwoord binnen 3 werkdagen' : 'Antwoord binnen 3 werkdagen'}
          />
          <ContactCard
            icon={<MapPin className="h-4 w-4" />}
            label={isEN ? 'Address' : 'Adres'}
            primary={<span className="font-medium text-stone-900">Maastricht, NL</span>}
            sub={isEN ? 'Local delivery 6200–6229' : 'Lokale bezorging 6200–6229'}
          />
        </div>

        <Link
          href="/faq"
          className="mt-4 group flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-5 hover:border-(--color-brand-yellow-bright)/40 hover:bg-(--color-brand-yellow-bright)/5 transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-stone-100 text-stone-700 inline-flex items-center justify-center shrink-0 group-hover:bg-(--color-brand-yellow-bright)/20 group-hover:text-(--color-brand-yellow) transition-colors">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-stone-900 text-sm">
                {isEN ? 'Check the FAQ first' : 'Eerst even de FAQ checken?'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isEN
                  ? 'Quick answers on ordering, delivery, meals and refunds.'
                  : 'Snelle antwoorden over bestellen, bezorging, maaltijden en refunds.'}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-(--color-brand-yellow) group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        <p className="mt-12 text-xs text-stone-500 font-mono">
          AMIS Meals · KvK [wordt nog ingevuld] · BTW NL[…]B01
        </p>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  primary,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  primary: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-7 w-7 rounded-lg bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow) inline-flex items-center justify-center">
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          {label}
        </span>
      </div>
      <div className="text-sm">{primary}</div>
      <p className="text-xs text-stone-500 mt-1">{sub}</p>
    </div>
  );
}
