'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, Link } from '@/lib/i18n/navigation';
import { useCart, cartItemCount, cartSubtotalCents } from '@/lib/cart/store';
import { useCheckout, isMaastrichtPostalCode } from '@/lib/checkout/store';
import { StepIndicator } from '@/components/checkout/step-indicator';
import { OrderSummary } from '@/components/checkout/order-summary';
import { ArrowLeft, ArrowRight, Truck, MapPin, Tag, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { validateDiscountCodeAction } from '@/app/admin/_actions/discount';
import { formatMoneyCents } from '@/lib/utils/money';

export default function CheckoutShippingPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const itemCount = cartItemCount(lines);
  const subtotal = cartSubtotalCents(lines);
  const shipping = useCheckout((s) => s.shipping);
  const shippingMethod = useCheckout((s) => s.shippingMethod);
  const setShippingMethod = useCheckout((s) => s.setShippingMethod);
  const discountCode = useCheckout((s) => s.discountCode);
  const setDiscount = useCheckout((s) => s.setDiscount);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && itemCount === 0) router.replace('/shop');
    if (mounted && !shipping.email) router.replace('/checkout/details');
  }, [mounted, itemCount, shipping.email, router]);

  const isLocal = isMaastrichtPostalCode(shipping.postal_code);

  // Default-select cheapest available method when first arriving.
  useEffect(() => {
    if (mounted && shippingMethod === null) {
      setShippingMethod(isLocal ? 'local' : 'postnl');
    }
  }, [mounted, shippingMethod, isLocal, setShippingMethod]);

  const [codeInput, setCodeInput] = useState(discountCode);
  const [discountMsg, setDiscountMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pending, start] = useTransition();

  function applyCode() {
    setDiscountMsg(null);
    start(async () => {
      const res = await validateDiscountCodeAction(codeInput, subtotal);
      if (res.ok && res.code) {
        setDiscount(res.code, res.valueCents);
        setDiscountMsg({ kind: 'ok', text: `${res.message ?? ''} (−${formatMoneyCents(res.valueCents)})` });
      } else {
        setDiscount('', 0);
        setDiscountMsg({ kind: 'err', text: res.message ?? 'Ongeldige code' });
      }
    });
  }

  function clearCode() {
    setCodeInput('');
    setDiscount('', 0);
    setDiscountMsg(null);
  }

  if (!mounted) return null;
  if (itemCount === 0) return null;

  return (
    <div className="container-amis py-12 md:py-16 pb-32 md:pb-16">
      <StepIndicator active="shipping" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2">
            Stap 2 van 3
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em] mb-6">Verzending</h1>

          {/* Address summary */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Bezorgadres</p>
                <p className="text-sm font-medium text-stone-900">
                  {shipping.first_name} {shipping.last_name}
                </p>
                <p className="text-sm text-stone-700 mt-0.5">
                  {shipping.street} {shipping.house_number}
                  {shipping.house_number_addition && ` ${shipping.house_number_addition}`}
                  <br />
                  <span className="font-mono">{shipping.postal_code}</span> {shipping.city}, {shipping.country}
                </p>
              </div>
              <Link
                href="/checkout/details"
                className="text-xs text-(--color-accent) hover:underline shrink-0"
              >
                Wijzig
              </Link>
            </div>
          </div>

          {/* Shipping method choices */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-stone-900">Verzendmethode</p>

            {isLocal && (
              <ShippingOption
                title="Lokale bezorging"
                description="Door ons team — donderdag tussen 16:00 en 20:00 in Maastricht en omgeving"
                price={subtotal >= 4000 ? 'Gratis' : '€3,95'}
                eta="Donderdag"
                selected={shippingMethod === 'local'}
                onClick={() => setShippingMethod('local')}
                icon={<MapPin className="h-4 w-4" />}
                badge="Maastricht"
              />
            )}
            <ShippingOption
              title="PostNL standaard"
              description="Bezorging in 1-2 werkdagen, met track & trace"
              price={subtotal >= 6000 ? 'Gratis' : '€6,95'}
              eta="1-2 werkdagen"
              selected={shippingMethod === 'postnl'}
              onClick={() => setShippingMethod('postnl')}
              icon={<Truck className="h-4 w-4" />}
            />
          </div>

          {/* Discount code */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-stone-500" />
              <p className="text-sm font-semibold text-stone-900">Kortingscode</p>
            </div>
            {discountCode && discountMsg?.kind !== 'err' ? (
              <div className="flex items-center justify-between rounded-md bg-(--color-accent-bright)/10 border border-(--color-accent-bright)/30 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm text-(--color-accent) font-medium">
                  <Check className="h-3.5 w-3.5" />
                  <span className="font-mono">{discountCode}</span>
                  {discountMsg && <span className="text-stone-600 font-normal">— {discountMsg.text}</span>}
                </div>
                <button
                  type="button"
                  onClick={clearCode}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                  aria-label="Verwijder code"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="BV. WELKOM10"
                  className="h-11 flex-1 rounded-md border border-stone-300 px-3 text-sm font-mono focus:outline-none focus:border-(--color-accent)"
                />
                <button
                  type="button"
                  onClick={applyCode}
                  disabled={pending || !codeInput.trim()}
                  className="h-11 px-5 rounded-md border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
                >
                  {pending ? 'Bezig…' : 'Toepassen'}
                </button>
              </div>
            )}
            {discountMsg?.kind === 'err' && (
              <p className="text-xs text-red-600 mt-2">{discountMsg.text}</p>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start order-first lg:order-last">
          <OrderSummary collapsibleOnMobile />
        </div>
      </div>

      {/* Action bar */}
      <div className="hidden md:flex justify-between mt-8 max-w-[calc(100%-372px)]">
        <Link
          href="/checkout/details"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50"
        >
          <ArrowLeft className="h-4 w-4" /> Vorige
        </Link>
        <button
          type="button"
          onClick={() => router.push('/checkout/payment')}
          className="inline-flex items-center gap-2 h-12 px-7 rounded-2xl bg-(--color-accent) text-white font-semibold text-sm hover:bg-(--color-accent)/90"
        >
          Volgende: Betaling <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 flex gap-2">
        <Link
          href="/checkout/details"
          className="h-12 px-4 rounded-2xl border border-stone-300 bg-white inline-flex items-center justify-center text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => router.push('/checkout/payment')}
          className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-2xl bg-(--color-accent) text-white font-semibold text-sm shadow-[0_8px_24px_-6px_rgba(74,138,60,0.5)]"
        >
          Volgende: Betaling <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ShippingOption({
  title,
  description,
  price,
  eta,
  selected,
  onClick,
  icon,
  badge,
}: {
  title: string;
  description: string;
  price: string;
  eta: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border-2 transition-all p-4 flex items-start gap-3',
        selected
          ? 'border-(--color-accent) bg-(--color-accent-bright)/10'
          : 'border-stone-200 bg-white hover:border-stone-300',
      )}
    >
      <div className={cn(
        'mt-0.5 h-9 w-9 shrink-0 rounded-full inline-flex items-center justify-center',
        selected ? 'bg-(--color-accent) text-white' : 'bg-stone-100 text-stone-600',
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-stone-900">{title}</p>
          <span className="font-mono font-semibold text-stone-900 text-sm">{price}</span>
        </div>
        <p className="text-xs text-stone-600 mt-0.5">{description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
            ETA: {eta}
          </span>
          {badge && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-(--color-accent) bg-(--color-accent-bright)/15 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className={cn(
        'h-5 w-5 shrink-0 rounded-full border-2 inline-flex items-center justify-center',
        selected ? 'border-(--color-accent) bg-(--color-accent)' : 'border-stone-300 bg-white',
      )}>
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}
