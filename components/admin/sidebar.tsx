'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  Package,
  Sparkles,
  Boxes,
  Star,
  Tag,
  Users,
  Settings,
  Shield,
  Webhook,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { UserRole } from '@/types/database';
import { logoutAction } from '@/app/admin/_actions/auth';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Bestellingen', icon: ShoppingCart },
  { href: '/admin/kitchen', label: 'Productie', icon: ChefHat },
  { href: '/admin/products', label: 'Producten', icon: Package },
  { href: '/admin/featured', label: 'Hot deze week', icon: Sparkles },
  { href: '/admin/stock', label: 'Voorraad', icon: Boxes },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/discount-codes', label: 'Kortingscodes', icon: Tag, ownerOnly: true },
  { href: '/admin/customers', label: 'Klanten', icon: Users },
  { href: '/admin/settings', label: 'Instellingen', icon: Settings, ownerOnly: true },
  { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook, ownerOnly: true },
  { href: '/admin/users', label: 'Gebruikers', icon: Shield, ownerOnly: true },
];

export function AdminSidebar({
  role,
  email,
  firstName,
  lastName,
  impersonated,
}: {
  role: UserRole;
  email: string;
  firstName: string | null;
  lastName: string | null;
  impersonated: boolean;
}) {
  const pathname = usePathname();
  const visibleNav = NAV.filter((item) => !item.ownerOnly || role === 'owner');

  function isActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 bg-[#0f1410] text-white flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-white/5 shrink-0">
        <Link href="/admin" className="flex items-baseline gap-2">
          <span className="font-bold text-lg tracking-[-0.04em]">AMIS</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    active
                      ? 'bg-(--color-brand-yellow)/15 text-(--color-brand-black) font-medium'
                      : 'text-white/65 hover:text-white hover:bg-white/5',
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-(--color-brand-yellow-bright) rounded-r-full"
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      active ? 'text-(--color-brand-yellow-bright)' : 'text-white/50 group-hover:text-white/70',
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.ownerOnly && (
                    <span className="ml-auto text-[9px] uppercase tracking-widest text-white/30">
                      owner
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/5 p-3 shrink-0">
        <div className="px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-(--color-brand-yellow)/20 text-(--color-brand-yellow-bright) inline-flex items-center justify-center font-semibold text-sm">
              {(firstName?.[0] ?? email[0] ?? 'A').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {firstName || lastName ? `${firstName ?? ''} ${lastName ?? ''}`.trim() : email}
              </p>
              <p className="text-[11px] text-white/50 truncate">
                {role === 'owner' ? 'Owner' : 'Staff'}
                {impersonated && ' · dev'}
              </p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-3 h-9 rounded-md bg-white/5 hover:bg-white/10 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
