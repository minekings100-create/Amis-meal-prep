'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { Link } from '@/lib/i18n/navigation';
import { useCart, cartItemCount } from '@/lib/cart/store';
import {
  useCheckout,
  isMaastrichtPostalCode,
  POSTAL_CODE_RE,
  PHONE_NL_RE,
} from '@/lib/checkout/store';
import { StepIndicator } from '@/components/checkout/step-indicator';
import { OrderSummary } from '@/components/checkout/order-summary';
import { ChevronDown, ChevronUp, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function CheckoutDetailsPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const itemCount = cartItemCount(lines);
  const shipping = useCheckout((s) => s.shipping);
  const setShipping = useCheckout((s) => s.setShipping);
  const billing = useCheckout((s) => s.billing);
  const setBilling = useCheckout((s) => s.setBilling);
  const giftToOtherAddress = useCheckout((s) => s.giftToOtherAddress);
  const setGiftToOtherAddress = useCheckout((s) => s.setGiftToOtherAddress);

  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => setMounted(true), []);

  // If cart empty after hydration, send back to shop.
  useEffect(() => {
    if (mounted && itemCount === 0) router.replace('/shop');
  }, [mounted, itemCount, router]);

  const isLocal = isMaastrichtPostalCode(shipping.postal_code);
  const validPostalCode = POSTAL_CODE_RE.test(shipping.postal_code.trim());
  const validPhone = PHONE_NL_RE.test(shipping.phone.replace(/\s|-/g, ''));

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!shipping.first_name.trim()) e.first_name = 'Verplicht';
    if (!shipping.last_name.trim()) e.last_name = 'Verplicht';
    if (!shipping.email.trim()) e.email = 'Verplicht';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) e.email = 'Geen geldig e-mailadres';
    if (!shipping.phone.trim()) e.phone = 'Verplicht';
    else if (!validPhone) e.phone = 'Ongeldig NL-nummer';
    if (!shipping.street.trim()) e.street = 'Verplicht';
    if (!shipping.house_number.trim()) e.house_number = 'Verplicht';
    if (!shipping.postal_code.trim()) e.postal_code = 'Verplicht';
    else if (!validPostalCode) e.postal_code = 'Ongeldig postcode';
    if (!shipping.city.trim()) e.city = 'Verplicht';

    if (giftToOtherAddress) {
      if (!billing.first_name.trim()) e.b_first_name = 'Verplicht';
      if (!billing.last_name.trim()) e.b_last_name = 'Verplicht';
      if (!billing.street.trim()) e.b_street = 'Verplicht';
      if (!billing.house_number.trim()) e.b_house_number = 'Verplicht';
      if (!billing.postal_code.trim()) e.b_postal_code = 'Verplicht';
      else if (!POSTAL_CODE_RE.test(billing.postal_code.trim())) e.b_postal_code = 'Ongeldig postcode';
      if (!billing.city.trim()) e.b_city = 'Verplicht';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    router.push('/checkout/shipping');
  }

  if (!mounted) return null;
  if (itemCount === 0) return null;

  return (
    <div className="container-amis py-12 md:py-16 pb-32 md:pb-16">
      <StepIndicator active="details" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
        <div>
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2">
              Stap 1 van 3
            </p>
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em]">Bezorggegevens</h1>
              <Link
                href={`/account/login?next=${encodeURIComponent('/checkout/details')}`}
                className="text-sm text-(--color-accent) hover:underline whitespace-nowrap"
              >
                Heb je al een account?
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Voornaam" error={errors.first_name}>
                <Input
                  value={shipping.first_name}
                  onChange={(v) => setShipping({ first_name: v })}
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Achternaam" error={errors.last_name}>
                <Input
                  value={shipping.last_name}
                  onChange={(v) => setShipping({ last_name: v })}
                  autoComplete="family-name"
                />
              </Field>
            </div>
            <Field label="E-mail" error={errors.email}>
              <Input
                type="email"
                value={shipping.email}
                onChange={(v) => setShipping({ email: v })}
                autoComplete="email"
              />
            </Field>
            <Field label="Telefoon" error={errors.phone} hint="Voor bezorgupdates · NL-nummer">
              <Input
                type="tel"
                value={shipping.phone}
                onChange={(v) => setShipping({ phone: v })}
                autoComplete="tel"
                placeholder="+31 6 1234 5678"
              />
            </Field>

            <div className="grid grid-cols-2 sm:grid-cols-[1fr_110px_110px] gap-3 sm:gap-4">
              <Field label="Straat" error={errors.street} className="col-span-2 sm:col-span-1">
                <Input
                  value={shipping.street}
                  onChange={(v) => setShipping({ street: v })}
                  autoComplete="address-line1"
                />
              </Field>
              <Field label="Huisnr." error={errors.house_number}>
                <Input
                  value={shipping.house_number}
                  onChange={(v) => setShipping({ house_number: v })}
                  mono
                />
              </Field>
              <Field label="Toevoeging" hint="Optioneel">
                <Input
                  value={shipping.house_number_addition}
                  onChange={(v) => setShipping({ house_number_addition: v })}
                  mono
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-[130px_1fr_90px] gap-3 sm:gap-4">
              <Field label="Postcode" error={errors.postal_code}>
                <Input
                  value={shipping.postal_code}
                  onChange={(v) => setShipping({ postal_code: v.toUpperCase() })}
                  autoComplete="postal-code"
                  placeholder="1234 AB"
                  mono
                />
              </Field>
              <Field label="Plaats" error={errors.city}>
                <Input
                  value={shipping.city}
                  onChange={(v) => setShipping({ city: v })}
                  autoComplete="address-level2"
                />
              </Field>
              <Field label="Land" className="col-span-2 sm:col-span-1">
                <select
                  value={shipping.country}
                  onChange={(e) => setShipping({ country: e.target.value })}
                  className="h-11 w-full rounded-md border border-stone-300 px-3 text-sm focus:outline-none focus:border-(--color-accent)"
                >
                  <option value="NL">NL</option>
                  <option value="BE">BE</option>
                </select>
              </Field>
            </div>

            {validPostalCode && isLocal && (
              <div className="rounded-md bg-(--color-accent-bright)/10 border border-(--color-accent-bright)/30 px-4 py-2.5 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-(--color-accent)" />
                <span className="text-sm text-(--color-accent) font-medium">
                  Lokale bezorging beschikbaar
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-(--color-accent)">
                  Maastricht
                </span>
              </div>
            )}

            <Field label="Opmerking voor de keuken" hint="Optioneel — bezorgmoment, allergieën">
              <textarea
                value={shipping.customer_note}
                onChange={(e) => setShipping({ customer_note: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-(--color-accent)"
              />
            </Field>
          </div>

          {/* Gift toggle */}
          <GiftAddressSection
            open={giftToOtherAddress}
            onToggle={setGiftToOtherAddress}
            billing={billing}
            setBilling={setBilling}
            errors={errors}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start order-first lg:order-last">
          <OrderSummary collapsibleOnMobile />
        </div>
      </div>

      {/* Sticky next button on mobile, inline on desktop */}
      <div className="hidden md:flex justify-end mt-8 max-w-[calc(100%-372px)]">
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center gap-2 h-12 px-7 rounded-2xl bg-(--color-accent) text-white font-semibold text-sm hover:bg-(--color-accent)/90 transition-colors"
        >
          Volgende: Verzending
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30">
        <button
          type="button"
          onClick={next}
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-2xl bg-(--color-accent) text-white font-semibold text-sm shadow-[0_8px_24px_-6px_rgba(74,138,60,0.5)]"
        >
          Volgende: Verzending
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
function GiftAddressSection({
  open,
  onToggle,
  billing,
  setBilling,
  errors,
}: {
  open: boolean;
  onToggle: (v: boolean) => void;
  billing: ReturnType<typeof useCheckout.getState>['billing'];
  setBilling: (patch: Partial<ReturnType<typeof useCheckout.getState>['billing']>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => onToggle(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div>
          <p className="text-sm font-medium text-stone-900">Cadeau? Bezorg op een ander adres</p>
          <p className="text-xs text-stone-500 mt-0.5">Bezorgadres wijkt af van factuuradres</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
      </button>
      {open && (
        <div className="px-6 pb-5 space-y-4 border-t border-stone-100 pt-4">
          <p className="text-xs text-stone-500">
            Vul hier het factuuradres in. De bestelling wordt afgeleverd op het bovenstaande
            (cadeau-)adres.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Voornaam (factuur)" error={errors.b_first_name}>
              <Input value={billing.first_name} onChange={(v) => setBilling({ first_name: v })} />
            </Field>
            <Field label="Achternaam (factuur)" error={errors.b_last_name}>
              <Input value={billing.last_name} onChange={(v) => setBilling({ last_name: v })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-[1fr_110px_110px] gap-3 sm:gap-4">
            <Field label="Straat" error={errors.b_street} className="col-span-2 sm:col-span-1">
              <Input value={billing.street} onChange={(v) => setBilling({ street: v })} />
            </Field>
            <Field label="Huisnr." error={errors.b_house_number}>
              <Input value={billing.house_number} onChange={(v) => setBilling({ house_number: v })} mono />
            </Field>
            <Field label="Toev." hint="Optioneel">
              <Input value={billing.house_number_addition} onChange={(v) => setBilling({ house_number_addition: v })} mono />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-[130px_1fr_90px] gap-3 sm:gap-4">
            <Field label="Postcode" error={errors.b_postal_code}>
              <Input value={billing.postal_code} onChange={(v) => setBilling({ postal_code: v.toUpperCase() })} mono placeholder="1234 AB" />
            </Field>
            <Field label="Plaats" error={errors.b_city}>
              <Input value={billing.city} onChange={(v) => setBilling({ city: v })} />
            </Field>
            <Field label="Land" className="col-span-2 sm:col-span-1">
              <select
                value={billing.country}
                onChange={(e) => setBilling({ country: e.target.value })}
                className="h-11 w-full rounded-md border border-stone-300 px-3 text-sm focus:outline-none focus:border-(--color-accent)"
              >
                <option value="NL">NL</option>
                <option value="BE">BE</option>
              </select>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-xs font-medium text-stone-700 mb-1">
        {label}
        {hint && <span className="text-stone-400 font-normal ml-1.5">— {hint}</span>}
      </span>
      {children}
      {error && <span className="block text-[11px] text-red-600 mt-1">{error}</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className={cn(
        'h-11 w-full rounded-md border border-stone-300 px-4 text-sm focus:outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-bright)/30',
        mono && 'font-mono tabular-nums',
      )}
    />
  );
}
