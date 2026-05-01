'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, User, MapPin, Star, LogOut } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import { logoutAction } from '@/app/_actions/account';
import type { CustomerProfile } from '@/lib/account/auth';

const NAV = [
  { href: '/account', label: 'Overzicht', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'Bestellingen', icon: ShoppingBag },
  { href: '/account/profile', label: 'Profiel', icon: User },
  { href: '/account/addresses', label: 'Adressen', icon: MapPin },
  { href: '/account/reviews', label: 'Reviews', icon: Star },
];

export function AccountSidebar({ customer }: { customer: CustomerProfile }) {
  const pathname = usePathname();
  const initial = (customer.firstName?.[0] ?? customer.email[0] ?? 'A').toUpperCase();
  const fullName =
    customer.firstName || customer.lastName
      ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
      : customer.email;

  function isActive(href: string, exact: boolean): boolean {
    const stripped = pathname?.replace(/^\/(?:nl|en)/, '') ?? '';
    if (exact) return stripped === href;
    return stripped === href || stripped.startsWith(href + '/');
  }

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl bg-white border border-stone-200 p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-(--color-accent-bright)/15 text-(--color-accent) inline-flex items-center justify-center font-semibold">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-900 truncate">{fullName}</p>
            <p className="text-[11px] text-stone-500 truncate">
              {customer.email}
              {customer.impersonated && ' · dev'}
            </p>
          </div>
        </div>
      </div>

      <nav>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, !!item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    active
                      ? 'bg-(--color-accent-bright)/15 text-(--color-accent) font-medium'
                      : 'text-stone-700 hover:bg-stone-100',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            className="w-full inline-flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Uitloggen
          </button>
        </form>
      </nav>
    </aside>
  );
}
