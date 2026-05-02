import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  Mail,
  StickyNote,
  Tag,
  History,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityEntry } from '@/lib/admin/order-detail';

const ACTIONS: Record<
  string,
  { label: string; icon: LucideIcon; tone: 'default' | 'success' | 'warn' | 'danger' }
> = {
  'order.created': { label: 'Order aangemaakt', icon: ShoppingBag, tone: 'default' },
  'payment.received': { label: 'Betaling ontvangen', icon: CheckCircle2, tone: 'success' },
  'order.preparing': { label: 'In voorbereiding', icon: PackageCheck, tone: 'default' },
  'sendcloud.label_created': { label: 'Sendcloud-label aangemaakt', icon: Truck, tone: 'success' },
  'order.shipped': { label: 'Order verzonden', icon: Truck, tone: 'success' },
  'order.delivered': { label: 'Order geleverd', icon: PackageCheck, tone: 'success' },
  'order.cancelled': { label: 'Order geannuleerd', icon: XCircle, tone: 'danger' },
  'refund.initiated': { label: 'Refund geïnitieerd', icon: RotateCcw, tone: 'warn' },
  'note.updated': { label: 'Interne notitie bijgewerkt', icon: StickyNote, tone: 'default' },
  'note.added': { label: 'Notitie toegevoegd', icon: StickyNote, tone: 'default' },
  'email.sent': { label: 'Email verzonden', icon: Mail, tone: 'default' },
  'discount.applied': { label: 'Kortingscode toegepast', icon: Tag, tone: 'default' },
};

const toneClass = {
  default: 'bg-stone-100 text-stone-600',
  success: 'bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow)',
  warn: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};

const dateFmt = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function ActivityLog({ activity }: { activity: ActivityEntry[] }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-3.5 w-3.5 text-stone-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Activiteit</h3>
      </div>
      {activity.length === 0 ? (
        <p className="text-sm text-stone-400">Geen activiteit nog.</p>
      ) : (
        <ul className="space-y-3">
          {activity.map((a) => {
            const meta = ACTIONS[a.action] ?? {
              label: a.action,
              icon: History,
              tone: 'default' as const,
            };
            const Icon = meta.icon;
            const detailText = renderDetails(a);
            return (
              <li key={a.id} className="flex gap-2.5">
                <div
                  className={`shrink-0 h-7 w-7 rounded-full inline-flex items-center justify-center ${toneClass[meta.tone]}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-900 leading-tight">{meta.label}</p>
                  {detailText && (
                    <p className="text-xs text-stone-500 mt-0.5 break-words">{detailText}</p>
                  )}
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {a.actorName} · {dateFmt.format(new Date(a.createdAt))}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function renderDetails(a: ActivityEntry): string | null {
  if (!a.details) return null;
  if (a.action === 'refund.initiated' && typeof a.details.amount_cents === 'number') {
    return `${(a.details.amount_cents / 100).toFixed(2)} € · ${a.details.reason ?? 'geen reden'}`;
  }
  if (a.action === 'sendcloud.label_created') {
    return `Tracking ${a.details.tracking_number ?? '—'}`;
  }
  if (a.action === 'order.cancelled' && a.details.reason) {
    return String(a.details.reason);
  }
  if (a.action === 'note.added' && a.details.note) {
    return String(a.details.note);
  }
  if (a.action === 'email.sent' && a.details.template) {
    return `Template: ${a.details.template}`;
  }
  return null;
}
