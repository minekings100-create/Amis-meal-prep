'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, Link } from '@/lib/i18n/navigation';
import { useCart, cartItemCount, cartSubtotalCents } from '@/lib/cart/store';
import { useCheckout, type PaymentMethod } from '@/lib/checkout/store';
import { StepIndicator } from '@/components/checkout/step-indicator';
import { OrderSummary, getShippingFeeCents } from '@/components/checkout/order-summary';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createCheckoutSessionAction } from '@/app/_actions/checkout';
import { formatMoneyCents } from '@/lib/utils/money';

interface PaymentOption {
  key: PaymentMethod;
  label: string;
  description: string;
  emoji: string;
  beOnly?: boolean;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { key: 'ideal', label: 'iDEAL', description: 'Direct via je bank — meest gebruikt in NL', emoji: '🏦' },
  { key: 'creditcard', label: 'Creditcard', description: 'Visa, Mastercard, Amex', emoji: '💳' },
  { key: 'klarna', label: 'Klarna', description: 'Achteraf betalen binnen 14 dagen', emoji: '🅺' },
  { key: 'applepay', label: 'Apple Pay', description: 'Snel afrekenen op Apple-apparaten', emoji: '' },
  { key: 'bancontact', label: 'Bancontact', description: 'Voor Belgische bankrekeningen', emoji: '🇧🇪', beOnly: true },
];

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const itemCount = cartItemCount(lines);
  const subtotal = cartSubtotalCents(lines);
  const clearCart = useCart((s) => s.clear);

  const shipping = useCheckout((s) => s.shipping);
  const billing = useCheckout((s) => s.billing);
  const giftToOtherAddress = useCheckout((s) => s.giftToOtherAddress);
  const shippingMethod = useCheckout((s) => s.shippingMethod);
  const discountCode = useCheckout((s) => s.discountCode);
  const discountValueCents = useCheckout((s) => s.discountValueCents);
  const paymentMethod = useCheckout((s) => s.paymentMethod);
  const setPaymentMethod = useCheckout((s) => s.setPaymentMethod);
  const termsAccepted = useCheckout((s) => s.termsAccepted);
  const setTermsAccepted = useCheckout((s) => s.setTermsAccepted);
  const reset = useCheckout((s) => s.reset);

  const [mounted, setMounted] = useState(false);
  const [supportsApplePay, setSupportsApplePay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const w = window as unknown as { ApplePaySession?: { canMakePayments?: () => boolean } };
      setSupportsApplePay(Boolean(w.ApplePaySession?.canMakePayments?.()));
    }
  }, []);

  useEffect(() => {
    if (mounted && itemCount === 0) router.replace('/shop');
    if (mounted && !shipping.email) router.replace('/checkout/details');
    if (mounted && shippingMethod === null) router.replace('/checkout/shipping');
  }, [mounted, itemCount, shipping.email, shippingMethod, router]);

  const shippingCents = getShippingFeeCents(shippingMethod, subtotal);
  const totalCents = Math.max(0, subtotal - discountValueCents) + shippingCents;

  function placeOrder() {
    setError(null);
    if (!termsAccepted) {
      setError('Accepteer de algemene voorwaarden');
      return;
    }
    if (!shippingMethod) return;
    start(async () => {
      const res = await createCheckoutSessionAction({
        lines,
        shipping,
        billing: giftToOtherAddress ? billing : null,
        shippingMethod,
        shippingCents,
        discountCode,
        discountValueCents,
        paymentMethod,
      });
      if (!res.ok) {
        setError(res.message ?? 'Kon order niet aanmaken');
        return;
      }
      // STUB: real Mollie flow returns external URL; mocked flow goes to /checkout/success directly
      clearCart();
      reset();
      if (res.redirectUrl) router.push(res.redirectUrl);
    });
  }

  if (!mounted) return null;
  if (itemCount === 0 || !shipping.email || !shippingMethod) return null;

  const visiblePaymentOptions = PAYMENT_OPTIONS.filter((o) => {
    if (o.key === 'applepay' && !supportsApplePay) return false;
    return true;
  });

  return (
    <div className="container-amis py-12 md:py-16 pb-32 md:pb-16">
      <StepIndicator active="payment" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2">
            Stap 3 van 3
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em] mb-6">Betaling</h1>

          {/* Address + shipping summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <SummaryCard
              title="Bezorgadres"
              editHref="/checkout/details"
              body={
                <>
                  {shipping.first_name} {shipping.last_name}
                  <br />
                  {shipping.street} {shipping.house_number}
                  {shipping.house_number_addition && ` ${shipping.house_number_addition}`}
                  <br />
                  <span className="font-mono">{shipping.postal_code}</span> {shipping.city}
                </>
              }
            />
            <SummaryCard
              title="Verzending"
              editHref="/checkout/shipping"
              body={
                shippingMethod === 'local' ? (
                  <>Lokale bezorging Maastricht<br />Donderdag 16:00–20:00</>
                ) : (
                  <>PostNL standaard<br />1-2 werkdagen, met track & trace</>
                )
              }
            />
          </div>

          {/* Payment options */}
          <div className="space-y-2 mb-6">
            <p className="text-sm font-semibold text-stone-900 mb-2">Betaalmethode</p>
            {visiblePaymentOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setPaymentMethod(option.key)}
                className={cn(
                  'w-full text-left rounded-2xl border-2 transition-all p-4 flex items-center gap-3',
                  paymentMethod === option.key
                    ? 'border-(--color-brand-black) bg-stone-50'
                    : 'border-stone-200 bg-white hover:border-stone-300',
                )}
              >
                <span className="text-xl shrink-0 w-8 text-center">{option.emoji || '💰'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm">{option.label}</p>
                  <p className="text-xs text-stone-600">{option.description}</p>
                </div>
                <div className={cn(
                  'h-5 w-5 shrink-0 rounded-full border-2 inline-flex items-center justify-center',
                  paymentMethod === option.key ? 'border-(--color-brand-black) bg-(--color-brand-black)' : 'border-stone-300 bg-white',
                )}>
                  {paymentMethod === option.key && <Check className="h-3 w-3 text-white" />}
                </div>
              </button>
            ))}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-(--color-brand-black) focus:ring-(--color-brand-yellow-bright)"
            />
            <span className="text-sm text-stone-700">
              Ik ga akkoord met de{' '}
              <Link href="/algemene-voorwaarden" className="text-(--color-brand-yellow) hover:underline" target="_blank">
                algemene voorwaarden
              </Link>{' '}
              en het{' '}
              <Link href="/privacybeleid" className="text-(--color-brand-yellow) hover:underline" target="_blank">
                privacybeleid
              </Link>
              .
            </span>
          </label>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start order-first lg:order-last">
          <OrderSummary collapsibleOnMobile />
        </div>
      </div>

      {/* Action bar */}
      <div className="hidden md:flex justify-between mt-8 max-w-[calc(100%-372px)]">
        <Link
          href="/checkout/shipping"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50"
        >
          <ArrowLeft className="h-4 w-4" /> Vorige
        </Link>
        <button
          type="button"
          onClick={placeOrder}
          disabled={pending || !termsAccepted}
          className="inline-flex items-center gap-2 h-12 px-7 rounded-2xl bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-stone-800 disabled:opacity-50 shadow-[0_8px_24px_-6px_rgba(10,10,10,0.35)]"
        >
          {pending ? 'Bezig…' : `Bestelling plaatsen ${formatMoneyCents(totalCents)}`}
        </button>
      </div>
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 flex gap-2">
        <Link
          href="/checkout/shipping"
          className="h-12 px-4 rounded-2xl border border-stone-300 bg-white inline-flex items-center justify-center text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={placeOrder}
          disabled={pending || !termsAccepted}
          className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-2xl bg-(--color-brand-black) text-white font-semibold text-sm shadow-[0_8px_24px_-6px_rgba(10,10,10,0.35)] disabled:opacity-50"
        >
          {pending ? 'Bezig…' : `Plaatsen — ${formatMoneyCents(totalCents)}`}
        </button>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  body,
  editHref,
}: {
  title: string;
  body: React.ReactNode;
  editHref: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{title}</p>
        <Link href={editHref} className="text-xs text-stone-600 hover:text-(--color-brand-black) underline underline-offset-2">
          Wijzig
        </Link>
      </div>
      <p className="text-sm text-stone-700 leading-snug">{body}</p>
    </div>
  );
}
