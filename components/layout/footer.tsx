import { useTranslations } from 'next-intl';
import { Instagram, Facebook, Music2 } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { NewsletterForm } from './newsletter-form';
import { CookieSettingsLink } from '@/components/legal/cookie-consent';

export function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-(--color-ink) text-white relative overflow-hidden">
      {/* Big subtle AMIS watermark behind everything */}
      <div
        aria-hidden
        className="absolute -bottom-12 -right-12 select-none pointer-events-none text-[28rem] font-bold tracking-[-0.06em] text-white/[0.02] leading-none"
      >
        AMIS
      </div>

      <div className="container-amis py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl tracking-[-0.04em]">AMIS</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">meals</span>
          </div>
          <p className="mt-4 text-sm text-white/70 max-w-xs leading-relaxed">{t('tagline')}</p>

          <div className="flex gap-2 mt-6">
            <SocialLink href="https://instagram.com/amismeals" label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialLink>
            <SocialLink href="https://facebook.com/amismeals" label="Facebook">
              <Facebook className="h-4 w-4" />
            </SocialLink>
            <SocialLink href="https://tiktok.com/@amismeals" label="TikTok">
              <Music2 className="h-4 w-4" />
            </SocialLink>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
              {t('newsletter')}
            </p>
            <p className="text-xs text-white/60 mb-3">{t('newsletterCopy')}</p>
            <NewsletterForm subscribeLabel={t('subscribe')} />
          </div>
        </div>

        {/* Shop */}
        <FooterColumn title={t('shop')}>
          <FooterLink href="/shop">{tn('shop')}</FooterLink>
          <FooterLink href="/shop?type=meal">Losse maaltijden</FooterLink>
          <FooterLink href="/shop?type=package">Pakketten</FooterLink>
          <FooterLink href="/shop?type=tryout">Try-out box</FooterLink>
          <FooterLink href="#" disabled>
            Cadeaubonnen
          </FooterLink>
          <FooterLink href="/shop?goal=cut">Cut</FooterLink>
          <FooterLink href="/shop?goal=bulk">Bulk</FooterLink>
        </FooterColumn>

        {/* Klantenservice */}
        <FooterColumn title={t('support')}>
          <FooterLink href="/faq">{t('faq')}</FooterLink>
          <FooterLink href="/contact">{t('contact')}</FooterLink>
          <FooterLink href="/algemene-voorwaarden">{t('terms')}</FooterLink>
          <FooterLink href="/privacybeleid">{t('privacy')}</FooterLink>
          <li>
            <CookieSettingsLink>Cookie-instellingen</CookieSettingsLink>
          </li>
        </FooterColumn>

        {/* Bedrijf */}
        <FooterColumn title={t('company')}>
          <FooterLink href="/over-ons">{t('about')}</FooterLink>
          <FooterLink href="/faq#bezorging">Bezorging</FooterLink>
          <FooterLink href="#" disabled>
            Werken bij AMIS
          </FooterLink>
        </FooterColumn>
      </div>

      {/* Bottom band */}
      <div className="border-t border-white/10 relative z-10">
        <div className="container-amis py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/50">
          <div className="space-y-0.5">
            <span className="block">
              © {year} AMIS Meals · {t('rights')}
            </span>
            <span className="block font-mono">
              KvK <em className="text-white/30 not-italic">[wordt nog ingevuld]</em> · BTW{' '}
              <em className="text-white/30 not-italic">NL[…]B01</em>
            </span>
          </div>

          {/* Payment method strip */}
          <div className="flex items-center gap-2 flex-wrap">
            <PaymentChip>iDEAL</PaymentChip>
            <PaymentChip>Visa</PaymentChip>
            <PaymentChip>Mastercard</PaymentChip>
            <PaymentChip>Klarna</PaymentChip>
            <PaymentChip>Bancontact</PaymentChip>
            <PaymentChip>Apple Pay</PaymentChip>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.18em] text-white/50 mb-4">{title}</h4>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <li>
        <span className="text-white/30 cursor-not-allowed inline-flex items-center gap-1.5">
          {children}
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10">
            soon
          </span>
        </span>
      </li>
    );
  }
  return (
    <li>
      <Link href={href} className="text-white/80 hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
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
      className="h-9 w-9 rounded-full bg-white/5 border border-white/10 inline-flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </a>
  );
}

function PaymentChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-white/60">
      {children}
    </span>
  );
}
