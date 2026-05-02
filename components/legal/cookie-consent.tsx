'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Cookie } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import { getConsent, setConsent } from '@/lib/legal/consent';

export function CookieConsent() {
  const [needsConsent, setNeedsConsent] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const sync = () => setNeedsConsent(getConsent() === null);
    sync();
    window.addEventListener('amis-consent-changed', sync);
    window.addEventListener('amis-open-cookie-prefs', () => setPrefsOpen(true));
    return () => {
      window.removeEventListener('amis-consent-changed', sync);
    };
  }, []);

  function acceptAll() {
    setConsent({ analytics: true, marketing: true });
  }
  function essentialOnly() {
    setConsent({ analytics: false, marketing: false });
  }
  function savePrefs() {
    setConsent({ analytics, marketing });
    setPrefsOpen(false);
  }

  return (
    <>
      <AnimatePresence>
        {needsConsent && !prefsOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="region"
            aria-label="Cookie-toestemming"
            className="fixed z-50 left-3 right-3 bottom-3 md:left-1/2 md:-translate-x-1/2 md:right-auto md:bottom-4 md:w-[480px] max-w-[calc(100vw-1.5rem)]"
          >
            <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_24px_64px_-16px_rgba(19,22,19,0.32)] p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow) inline-flex items-center justify-center shrink-0">
                  <Cookie className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm">Cookies</p>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1">
                    We gebruiken essentiële cookies voor je winkelmand en account. Met jouw
                    toestemming gebruiken we ook analytics-cookies om de site te verbeteren.{' '}
                    <Link href="/privacybeleid" className="text-(--color-brand-yellow) hover:underline">
                      Meer info
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={essentialOnly}
                  className="h-9 px-3 rounded-lg border border-stone-300 bg-white text-xs font-medium hover:bg-stone-50"
                >
                  Alleen essentieel
                </button>
                <button
                  type="button"
                  onClick={() => setPrefsOpen(true)}
                  className="h-9 px-2 text-xs text-stone-500 hover:text-stone-900"
                >
                  Voorkeuren
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="ml-auto h-9 px-4 rounded-lg bg-(--color-brand-yellow) text-(--color-brand-black) text-xs font-semibold hover:bg-(--color-brand-yellow)/90"
                >
                  Accepteren
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog.Root
        open={prefsOpen}
        onOpenChange={(v) => {
          setPrefsOpen(v);
          if (v) {
            const existing = getConsent();
            setAnalytics(existing?.analytics ?? false);
            setMarketing(existing?.marketing ?? false);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md rounded-2xl bg-white shadow-2xl p-6 focus:outline-none">
            <div className="flex items-start justify-between gap-4 mb-4">
              <Dialog.Title className="text-lg font-bold text-stone-900">
                Cookie-voorkeuren
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-100">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <p className="text-sm text-stone-600 mb-4">
              Kies welke cookies we mogen plaatsen. Essentiële cookies zijn altijd actief — die
              zijn nodig voor de site om te werken.
            </p>

            <div className="space-y-3">
              <PrefRow
                label="Essentieel"
                description="Winkelmand, sessie, taalvoorkeur. Niet uit te schakelen."
                checked
                disabled
                onChange={() => {}}
              />
              <PrefRow
                label="Analytics"
                description="Anonieme bezoekstatistieken die ons helpen de site te verbeteren."
                checked={analytics}
                onChange={setAnalytics}
              />
              <PrefRow
                label="Marketing"
                description="Niet actief bij AMIS — placeholder voor toekomstige campagnes."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Dialog.Close asChild>
                <button className="h-10 px-4 rounded-md border border-stone-300 text-sm hover:bg-stone-50">
                  Annuleren
                </button>
              </Dialog.Close>
              <button
                onClick={savePrefs}
                className="h-10 px-5 rounded-md bg-(--color-brand-yellow) text-(--color-brand-black) text-sm font-semibold hover:bg-(--color-brand-yellow)/90"
              >
                Bewaren
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function PrefRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors',
        checked
          ? 'border-(--color-brand-yellow) bg-(--color-brand-yellow-bright)/10'
          : 'border-stone-200 bg-white hover:bg-stone-50',
        disabled && 'opacity-90 cursor-default',
      )}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        <p className="text-xs text-stone-600 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-(--color-brand-yellow)' : 'bg-stone-300',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}

/**
 * Footer link helper — opens the cookie-prefs modal via a custom event.
 */
export function CookieSettingsLink({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('amis-open-cookie-prefs'));
        }
      }}
      className="text-white/80 hover:text-white transition-colors text-left"
    >
      {children}
    </button>
  );
}
