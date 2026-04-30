import { useTranslations } from 'next-intl';
import { ShoppingBag, User } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { LocaleSwitch } from './locale-switch';
import { CartIcon } from './cart-icon';

export function Header() {
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-[--color-line]">
      <div className="container-amis flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-bold text-xl tracking-[-0.04em] text-[--color-ink]">AMIS</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[--color-gray]">meals</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link
            href="/shop"
            className="text-[--color-ink-soft] hover:text-[--color-ink] transition-colors"
          >
            {t('shop')}
          </Link>
          <Link
            href="/atleten"
            className="text-[--color-ink-soft] hover:text-[--color-ink] transition-colors"
          >
            {t('athletes')}
          </Link>
          <Link
            href="/over-ons"
            className="text-[--color-ink-soft] hover:text-[--color-ink] transition-colors"
          >
            {t('about')}
          </Link>
          <Link
            href="/contact"
            className="text-[--color-ink-soft] hover:text-[--color-ink] transition-colors"
          >
            {t('contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <LocaleSwitch />
          <Link
            href="/account"
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full text-[--color-ink-soft] hover:bg-[--color-bg-soft] transition-colors"
            aria-label={t('account')}
          >
            <User className="h-4 w-4" />
          </Link>
          <CartIcon label={t('cart')} icon={<ShoppingBag className="h-4 w-4" />} />
        </div>
      </div>
    </header>
  );
}
