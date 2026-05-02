'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag, User } from 'lucide-react';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { LocaleSwitch } from './locale-switch';
import { CartIcon } from './cart-icon';
import { cn } from '@/lib/utils/cn';

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const isHero = pathname === '/'; // next-intl Link's pathname is locale-stripped
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reset scroll-state on path change (so navigating from a scrolled hero to another page
  // doesn't lock us into "scrolled" colors).
  useEffect(() => {
    setScrolled(window.scrollY > 50);
  }, [pathname]);

  const transparent = isHero && !scrolled;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          transparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md border-b border-stone-200',
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className={cn(
              'flex items-baseline gap-2 transition-colors',
              transparent ? 'text-white' : 'text-stone-900',
            )}
          >
            <span className="font-bold text-xl tracking-[-0.04em]">AMIS</span>
            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.2em] transition-colors',
                transparent ? 'text-white/60' : 'text-stone-500',
              )}
            >
              meals
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {(
              [
                { href: '/shop', key: 'shop' },
                { href: '/over-ons', key: 'about' },
                { href: '/contact', key: 'contact' },
              ] as const
            ).map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(item.href + '/') === true;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative transition-colors py-1',
                    transparent
                      ? active
                        ? 'text-white'
                        : 'text-white/85 hover:text-white'
                      : active
                        ? 'text-stone-900'
                        : 'text-stone-600 hover:text-stone-900',
                  )}
                >
                  {t(item.key)}
                  {active && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full',
                        transparent ? 'bg-white' : 'bg-(--color-accent)',
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <LocaleSwitch transparent={transparent} />
            <Link
              href="/account"
              className={cn(
                'hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                transparent
                  ? 'text-white/85 hover:text-white hover:bg-white/10'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100',
              )}
              aria-label={t('account')}
            >
              <User className="h-4 w-4" />
            </Link>
            <CartIcon
              label={t('cart')}
              icon={<ShoppingBag className="h-4 w-4" />}
              transparent={transparent}
            />
          </div>
        </div>
      </header>

      {/* Spacer pushes content below fixed header on non-hero pages.
          Hero page has its own min-h that already accommodates the nav. */}
      {!isHero && <div className="h-16" aria-hidden />}
    </>
  );
}
