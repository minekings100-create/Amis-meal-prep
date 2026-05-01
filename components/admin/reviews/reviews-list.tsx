'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { Star, Check, Trash2, ShieldCheck, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  publishReviewAction,
  deleteReviewAction,
  bulkPublishFiveStarPendingAction,
} from '@/app/admin/_actions/reviews';
import type { AdminReview, ReviewsTab } from '@/lib/admin/reviews';

const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

export function ReviewsList({ rows, tab }: { rows: AdminReview[]; tab: ReviewsTab }) {
  const [bulkPending, startBulk] = useTransition();
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  function bulkPublish() {
    startBulk(async () => {
      const res = await bulkPublishFiveStarPendingAction();
      if (res.ok) setBulkResult(`${res.count ?? 0} reviews gepubliceerd`);
      setTimeout(() => setBulkResult(null), 4000);
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="text-stone-500">
          {tab === 'pending'
            ? 'Geen reviews wachten op moderatie.'
            : tab === 'published'
              ? 'Geen gepubliceerde reviews.'
              : 'Geen verwijderde reviews.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tab === 'pending' && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg">
          <p className="text-sm text-stone-600">
            {bulkResult || 'Snelle actie voor positieve feedback:'}
          </p>
          <button
            type="button"
            onClick={bulkPublish}
            disabled={bulkPending}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-(--color-accent) text-white text-xs font-medium hover:bg-(--color-accent)/90 disabled:opacity-60"
          >
            <Sparkles className="h-3 w-3" />
            {bulkPending ? 'Bezig…' : 'Publiceer alle 5★ reviews'}
          </button>
        </div>
      )}
      {rows.map((r) => (
        <ReviewCard key={r.id} review={r} tab={tab} />
      ))}
    </div>
  );
}

function ReviewCard({ review, tab }: { review: AdminReview; tab: ReviewsTab }) {
  const [pending, start] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState('');

  function publish() {
    start(async () => {
      await publishReviewAction(review.id);
    });
  }

  function confirmDelete() {
    start(async () => {
      await deleteReviewAction(review.id, reason);
      setDeleteOpen(false);
    });
  }

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 flex gap-5">
      {/* Product thumb */}
      <Link
        href={`/admin/products?q=${encodeURIComponent(review.productSlug)}`}
        className="shrink-0 hidden sm:block"
      >
        {review.productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.productImage} alt="" className="h-16 w-16 rounded-md object-cover bg-stone-100" />
        ) : (
          <div className="h-16 w-16 rounded-md bg-stone-100" />
        )}
      </Link>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Stars rating={review.rating} />
          <span className="text-xs font-mono text-stone-500">{dateFmt.format(new Date(review.createdAt))}</span>
          {review.isVerifiedPurchase && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent)">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
        {review.title && <h3 className="text-base font-semibold text-stone-900 leading-tight">{review.title}</h3>}
        {review.body && (
          <p className="text-sm text-stone-700 mt-1.5 leading-relaxed whitespace-pre-wrap">{review.body}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-stone-500">
          <span>
            <span className="text-stone-700 font-medium">{review.customerName}</span>{' '}
            <span className="text-stone-400">· {review.customerEmail}</span>
          </span>
          <span>
            Product:{' '}
            <Link href={`/admin/products?q=${encodeURIComponent(review.productSlug)}`} className="text-stone-700 hover:text-(--color-accent)">
              {review.productName}
            </Link>
          </span>
        </div>
        {review.isDeleted && review.deletedReason && (
          <p className="mt-3 text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5">
            <span className="font-semibold">Verwijderd reden:</span> {review.deletedReason}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex flex-col gap-2 self-start min-w-[160px]">
        {tab !== 'published' && (
          <button
            type="button"
            onClick={publish}
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-(--color-accent) text-white text-sm font-medium hover:bg-(--color-accent)/90 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" /> Publiceer
          </button>
        )}
        {tab !== 'deleted' && (
          <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
            <Dialog.Trigger asChild>
              <button className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md border border-red-200 bg-white text-sm font-medium text-red-700 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Verwijder
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
              <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl bg-white shadow-2xl p-6 focus:outline-none">
                <div className="flex items-start justify-between mb-4">
                  <Dialog.Title className="text-lg font-bold text-stone-900">Review verwijderen?</Dialog.Title>
                  <Dialog.Close asChild>
                    <button aria-label="Sluit" className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-100">
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
                <p className="text-sm text-stone-600 mb-3">
                  Soft delete: review verdwijnt uit shop. Reden helpt later terugzoeken.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Bijv. spam, niet productrelevant, scheldwoorden…"
                  className="w-full px-3 py-2 rounded-md border border-stone-200 text-sm focus:outline-none focus:border-(--color-accent)"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Dialog.Close asChild>
                    <button className="h-10 px-4 rounded-md border border-stone-200 text-sm hover:bg-stone-50">Annuleren</button>
                  </Dialog.Close>
                  <button
                    onClick={confirmDelete}
                    disabled={pending}
                    className="h-10 px-4 rounded-md bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60"
                  >
                    {pending ? 'Verwijderen…' : 'Bevestig verwijderen'}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
    </article>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-4 w-4',
            n <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200',
          )}
        />
      ))}
    </div>
  );
}
