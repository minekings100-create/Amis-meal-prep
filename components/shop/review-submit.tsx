'use client';

import { useState, useTransition } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, ShieldCheck, Lock, Send, Check } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import { submitReviewAction } from '@/app/_actions/reviews';
import type { ReviewEligibility } from '@/lib/reviews/types';

const TITLE_MAX = 100;
const BODY_MAX = 1000;

export function ReviewSubmit({
  productId,
  productSlug,
  eligibility,
}: {
  productId: string;
  productSlug: string;
  eligibility: ReviewEligibility;
}) {
  if (!eligibility.signedIn) {
    return (
      <Card>
        <p className="text-sm text-stone-700 mb-3">
          Heb je dit product geprobeerd? Schrijf een review!
        </p>
        <Link
          href={`/account/login?next=${encodeURIComponent(`/shop/${productSlug}`)}`}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-(--color-brand-black) text-white text-sm font-semibold hover:bg-stone-800"
        >
          <Lock className="h-3.5 w-3.5" />
          Inloggen om te reviewen
        </Link>
      </Card>
    );
  }

  if (!eligibility.verifiedBuyer && !eligibility.existing) {
    return (
      <Card>
        <p className="text-sm text-stone-700">
          Alleen klanten die dit product besteld hebben kunnen reviewen.{' '}
          <Link href="/shop" className="text-stone-900 underline underline-offset-2 hover:text-(--color-brand-black)">
            Bekijk producten
          </Link>
        </p>
      </Card>
    );
  }

  return <SubmitForm productId={productId} eligibility={eligibility} />;
}

function SubmitForm({
  productId,
  eligibility,
}: {
  productId: string;
  eligibility: ReviewEligibility;
}) {
  const reduce = useReducedMotion();
  const existing = eligibility.existing;
  const isEditable = !existing || existing.isEditable;
  const editingExisting = !!existing && existing.isEditable;
  const lockedExisting = !!existing && !existing.isEditable;

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // If we have an existing locked review, show it read-only with a tooltip-like note.
  if (lockedExisting && existing) {
    const reason = existing.isPublished
      ? 'Gepubliceerde reviews kunnen niet meer worden gewijzigd. Neem contact op via support voor aanpassingen.'
      : existing.isDeleted
        ? 'Deze review is verwijderd door moderatie.'
        : 'Reviews zijn bewerkbaar tot 24u na plaatsing. Daarna alleen via support.';
    return (
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-900">Jouw review</p>
          <ReviewStatePill existing={existing} />
        </div>
        <Stars rating={existing.rating} />
        {existing.title && <h3 className="mt-2 font-semibold text-stone-900">{existing.title}</h3>}
        {existing.body && (
          <p className="mt-1 text-sm text-stone-700 leading-relaxed">{existing.body}</p>
        )}
        <p className="mt-4 text-xs text-stone-500" title={reason}>
          Niet meer te bewerken
        </p>
      </Card>
    );
  }

  function submit() {
    setError(null);
    setSuccess(null);
    if (rating === 0) {
      setError('Geef een waardering met sterren');
      return;
    }
    start(async () => {
      const res = await submitReviewAction({ productId, rating, title, body });
      if (!res.ok) {
        setError(res.message ?? 'Er ging iets mis');
        return;
      }
      setSuccess(res.message ?? 'Review verstuurd');
    });
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-4 w-4 text-stone-700" />
        <p className="text-sm font-semibold text-stone-900">
          {editingExisting ? 'Bewerk je review' : 'Schrijf een review'}
        </p>
        <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-white bg-(--color-brand-black) px-2 py-0.5 rounded-full">
          Verified
        </span>
      </div>

      {/* Star picker */}
      <div className="mb-4">
        <p className="text-xs font-medium text-stone-700 mb-2">Jouw waardering</p>
        <div
          className="inline-flex"
          onMouseLeave={() => setHoverRating(0)}
          role="radiogroup"
          aria-label="Sterren"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hoverRating || rating) >= n;
            return (
              <motion.button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                whileHover={reduce ? undefined : { scale: 1.15 }}
                animate={reduce ? undefined : rating === n ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.2 }}
                className="p-1"
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    filled ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200',
                  )}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <label className="block mb-3">
        <span className="block text-xs font-medium text-stone-700 mb-1">
          Titel
          <span className="text-stone-400 font-normal ml-1">— max {TITLE_MAX} karakters</span>
        </span>
        <input
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bijv. Beste meal prep van Maastricht"
          disabled={!isEditable}
          className="h-11 w-full rounded-md border border-stone-300 px-3 text-sm focus:outline-none focus:border-(--color-brand-yellow) disabled:bg-stone-50"
        />
      </label>

      {/* Body */}
      <label className="block mb-2">
        <span className="block text-xs font-medium text-stone-700 mb-1">Jouw ervaring</span>
        <textarea
          value={body}
          maxLength={BODY_MAX}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Wat vond je van de smaak, portie, macros, prijs/kwaliteit…"
          disabled={!isEditable}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-(--color-brand-yellow) disabled:bg-stone-50"
        />
        <span className="block text-right text-[11px] text-stone-400 mt-1">
          {body.length}/{BODY_MAX}
        </span>
      </label>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 mb-3 inline-flex items-center gap-2">
          <Check className="h-3.5 w-3.5 text-emerald-700" />
          <span className="text-sm text-emerald-800 font-medium">{success}</span>
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending || rating === 0 || !title.trim() || !body.trim()}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-(--color-brand-black) text-white text-sm font-semibold hover:bg-stone-800 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        {pending ? 'Versturen…' : editingExisting ? 'Wijzigingen opslaan' : 'Plaats review'}
      </button>
      <p className="text-[11px] text-stone-500 mt-3">
        Reviews worden binnen 24u gepubliceerd na moderatie. Je kan tot 24u na plaatsing nog wijzigen.
      </p>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-stone-200 p-6 mt-6">
      {children}
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn('h-5 w-5', n <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200')}
        />
      ))}
    </div>
  );
}

function ReviewStatePill({ existing }: { existing: NonNullable<ReviewEligibility['existing']> }) {
  if (existing.isDeleted) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-500 border border-stone-200">
        Verwijderd
      </span>
    );
  }
  if (existing.isPublished) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
        Gepubliceerd
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-(--color-brand-yellow-soft) text-(--color-brand-yellow-deep) border border-(--color-brand-yellow)">
      In review
    </span>
  );
}
