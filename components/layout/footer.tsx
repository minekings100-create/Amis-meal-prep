import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-(--color-ink) text-white">
      <div className="container-amis py-16 grid grid-cols-2 md:grid-cols-5 gap-12">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl tracking-[-0.04em]">AMIS</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">meals</span>
          </div>
          <p className="mt-4 text-sm text-white/70 max-w-xs leading-relaxed">{t('tagline')}</p>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
              {t('newsletter')}
            </p>
            <p className="text-xs text-white/60 mb-3">{t('newsletterCopy')}</p>
            <form className="flex gap-2 max-w-sm">
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 h-10 rounded-[--radius-sm] bg-white/10 border border-white/15 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-(--color-accent-bright)"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-[--radius-sm] bg-(--color-accent-bright) text-(--color-ink) text-sm font-medium hover:bg-white transition-colors"
              >
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-white/50 mb-4">{t('shop')}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/shop" className="text-white/80 hover:text-white transition-colors">
                {tn('shop')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-white/50 mb-4">{t('company')}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/over-ons" className="text-white/80 hover:text-white transition-colors">
                {t('about')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white/80 hover:text-white transition-colors">
                {t('contact')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-white/50 mb-4">{t('support')}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/faq" className="text-white/80 hover:text-white transition-colors">
                {t('faq')}
              </Link>
            </li>
            <li>
              <Link
                href="/algemene-voorwaarden"
                className="text-white/80 hover:text-white transition-colors"
              >
                {t('terms')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-white/80 hover:text-white transition-colors">
                {t('privacy')}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-amis py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>
            © {year} AMIS Meals · {t('rights')}
          </span>
          <span className="font-mono">Maastricht · NL</span>
        </div>
      </div>
    </footer>
  );
}
