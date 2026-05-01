'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { UserPlus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  inviteAdminAction,
  updateUserRoleAction,
  removeAdminAction,
} from '@/app/admin/_actions/users';
import type { AdminUserRow } from '@/lib/admin/users';

const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

const relTime = new Intl.RelativeTimeFormat('nl-NL', { numeric: 'auto' });
function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 60) return relTime.format(-m, 'minute');
  const h = Math.round(m / 60);
  if (h < 24) return relTime.format(-h, 'hour');
  const d = Math.round(h / 24);
  return relTime.format(-d, 'day');
}

export function UsersTable({ initialRows, currentUserId }: { initialRows: AdminUserRow[]; currentUserId: string }) {
  const [rows, setRows] = useState(initialRows);

  function patchRow(userId: string, patch: Partial<AdminUserRow>) {
    setRows((curr) => curr.map((r) => (r.userId === userId ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <InviteDialog />
      </div>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50/50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Naam</th>
              <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Email</th>
              <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500 w-[120px]">Rol</th>
              <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Aangemaakt</th>
              <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Laatste login</th>
              <th className="text-right px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((u) => (
              <UserRow key={u.userId} user={u} isSelf={u.userId === currentUserId} onPatch={(patch) => patchRow(u.userId, patch)} onRemove={() => setRows((c) => c.filter((r) => r.userId !== u.userId))} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  onPatch,
  onRemove,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  onPatch: (patch: Partial<AdminUserRow>) => void;
  onRemove: () => void;
}) {
  const [pending, start] = useTransition();
  const [confirmRemove, setConfirmRemove] = useState(false);

  function changeRole(role: 'staff' | 'owner') {
    if (role === user.role) return;
    onPatch({ role });
    start(async () => {
      const res = await updateUserRoleAction(user.userId, role);
      if (!res.ok) onPatch({ role: user.role });
    });
  }

  function remove() {
    start(async () => {
      const res = await removeAdminAction(user.userId);
      if (res.ok) onRemove();
      setConfirmRemove(false);
    });
  }

  return (
    <tr className="hover:bg-stone-50/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-stone-100 inline-flex items-center justify-center font-semibold text-xs text-stone-700">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-stone-900">{user.name}</p>
            {isSelf && <p className="text-[10px] text-stone-400 uppercase tracking-wider">Jij</p>}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-stone-600 font-mono text-xs">{user.email}</td>
      <td className="px-3 py-3">
        <select
          value={user.role}
          onChange={(e) => changeRole(e.target.value as 'staff' | 'owner')}
          disabled={pending || isSelf}
          className={cn(
            'h-8 w-full px-2 rounded-md border bg-white text-xs font-semibold uppercase tracking-wider',
            user.role === 'owner' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-700',
            isSelf && 'opacity-60 cursor-not-allowed',
          )}
        >
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </select>
      </td>
      <td className="px-3 py-3 text-stone-600 text-xs font-mono">
        {dateFmt.format(new Date(user.createdAt))}
      </td>
      <td className="px-3 py-3 text-stone-600 text-xs">
        {user.lastSignInAt ? timeAgo(user.lastSignInAt) : <span className="text-stone-400">Nooit</span>}
      </td>
      <td className="px-3 py-3 text-right">
        {!isSelf && (
          confirmRemove ? (
            <span className="inline-flex gap-1">
              <button
                onClick={() => setConfirmRemove(false)}
                className="h-7 px-2 rounded text-xs text-stone-600 hover:bg-stone-100"
              >
                Annuleer
              </button>
              <button
                onClick={remove}
                disabled={pending}
                className="h-7 px-2 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700"
              >
                {pending ? '…' : 'Bevestig'}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="inline-flex items-center gap-1 h-7 px-2 rounded text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
              Verwijder
            </button>
          )
        )}
      </td>
    </tr>
  );
}

function InviteDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'staff' | 'owner'>('staff');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function submit() {
    setError(null);
    setSuccess(null);
    start(async () => {
      const res = await inviteAdminAction(email, role);
      if (!res.ok) {
        setError(res.message ?? 'Kon niet uitnodigen');
        return;
      }
      setSuccess(res.message ?? 'Uitnodiging verstuurd');
      setEmail('');
      setRole('staff');
      setTimeout(() => setOpen(false), 1500);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(null); setSuccess(null); } }}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-[--color-accent] text-white text-sm font-medium hover:bg-[--color-accent]/90">
          <UserPlus className="h-4 w-4" />
          Nieuwe admin
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl bg-white shadow-2xl p-6 focus:outline-none">
          <div className="flex items-start justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-stone-900">Nodig een admin uit</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Sluit" className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-100">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <p className="text-sm text-stone-600 mb-4">
            Verstuur een magic-link uitnodiging via Resend. Bij klik op de link logt de persoon in en krijgt automatisch deze rol.
          </p>
          <div className="space-y-3">
            <label className="block">
              <span className="block text-xs font-medium text-stone-700 mb-1">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@amismeals.nl"
                className="w-full h-10 px-3 rounded-md border border-stone-200 text-sm focus:outline-none focus:border-[--color-accent]"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-700 mb-1">Rol</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'staff' | 'owner')}
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm"
              >
                <option value="staff">Staff (geen access tot Settings/Webhooks/Users/Discount-codes)</option>
                <option value="owner">Owner (volledige access)</option>
              </select>
            </label>
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          {success && <p className="text-sm text-[--color-accent] mt-3">{success}</p>}
          <div className="flex justify-end gap-2 mt-5">
            <Dialog.Close asChild>
              <button className="h-10 px-4 rounded-md border border-stone-200 text-sm hover:bg-stone-50">Annuleren</button>
            </Dialog.Close>
            <button
              onClick={submit}
              disabled={pending || !email}
              className="h-10 px-4 rounded-md bg-stone-900 text-white font-semibold text-sm hover:bg-black disabled:opacity-60"
            >
              {pending ? 'Versturen…' : 'Stuur uitnodiging'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
