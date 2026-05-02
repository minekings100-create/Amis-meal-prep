'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X, Instagram, Facebook, Music2, User, LogIn, LogOut, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { LocaleSwitch } from './locale-switch';
import { logoutAction } from '@/app/_actions/account';
import { cn } from '@/lib/utils/cn';

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transparent: boolean;
  isAuthed: boolean;
}

export function MobileMenu({ open, onOpenChange, transparent, isAuthed }: MobileMenuProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // Close panel on route change
  useEffect(() => {
    onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes; lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  const navItems = [
    { href: '/shop', label: t('shop') },
    { href: '/over-ons', label: t('about') },
    { href: '/contact', label: t('contact') },
    { href: '/faq', label: 'FAQ' },
  ] as const;

  const panelTransition = reduce
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className={cn(
          'md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors',
          transparent
            ? 'text-white/85 hover:text-white hover:bg-white/10'
            : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100',
        )}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Sluit menu"
              onClick={() => onOpenChange(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={panelTransition}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
            />

            {/* Panel */}
            <motion.div
              id="mobile-menu-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Mobiel menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={panelTransition}
              style={{ height: '100dvh' }}
              className="fixed top-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col md:hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-stone-100">
                <Link
                  href="/"
                  onClick={() => onOpenChange(false)}
                  className="flex items-baseline gap-2 text-stone-900"
                >
                  <span className="font-bold text-xl tracking-[-0.04em]">AMIS</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                    meals
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  aria-label="Sluit menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-6 py-2">
                <ul>
                  {navItems.map((item) => {
                    const active =
                      pathname === item.href || pathname?.startsWith(item.href + '/') === true;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => onOpenChange(false)}
                          className={cn(
                            'flex items-center justify-between gap-3 py-4 text-lg border-b border-stone-100 transition-colors',
                            active
                              ? 'text-(--color-brand-yellow) font-semibold'
                              : 'text-stone-900 hover:text-(--color-brand-yellow)',
                          )}
                        >
                          {item.label}
                          <ArrowRight
                            className={cn(
                              'h-4 w-4 transition-all',
                              active
                                ? 'text-(--color-brand-yellow) translate-x-0.5'
                                : 'text-stone-300',
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 pt-6 border-t border-stone-200 space-y-1">
                  <Link
                    href="/account"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 transition-colors"
                  >
                    <User className="h-4 w-4 text-stone-500" />
                    Mijn account
                  </Link>
                  {isAuthed ? (
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 text-stone-500" />
                        {t('logout')}
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/account/login"
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 transition-colors"
                    >
                      <LogIn className="h-4 w-4 text-stone-500" />
                      {t('login')}
                    </Link>
                  )}
                </div>
              </nav>

              {/* Panel footer */}
              <div className="px-6 py-5 border-t border-stone-100 flex items-center justify-between gap-4">
                <LocaleSwitch />
                <div className="flex items-center gap-2">
                  <SocialPill href="https://instagram.com/amismeals" label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </SocialPill>
                  <SocialPill href="https://facebook.com/amismeals" label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </SocialPill>
                  <SocialPill href="https://tiktok.com/@amismeals" label="TikTok">
                    <Music2 className="h-4 w-4" />
                  </SocialPill>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SocialPill({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="h-9 w-9 rounded-full bg-stone-100 text-stone-700 inline-flex items-center justify-center hover:bg-stone-200 hover:text-stone-900 transition-colors"
    >
      {children}
    </a>
  );
}
