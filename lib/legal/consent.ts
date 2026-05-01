'use client';

export interface ConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

export const CONSENT_VERSION = '1.0';
const COOKIE_NAME = 'amis-consent';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function getConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ').reduce<Record<string, string>>((acc, raw) => {
    const idx = raw.indexOf('=');
    if (idx === -1) return acc;
    acc[raw.slice(0, idx)] = decodeURIComponent(raw.slice(idx + 1));
    return acc;
  }, {});
  const raw = cookies[COOKIE_NAME];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(value: Omit<ConsentState, 'essential' | 'version' | 'timestamp'>): ConsentState {
  const state: ConsentState = {
    essential: true,
    analytics: !!value.analytics,
    marketing: !!value.marketing,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };
  if (typeof document !== 'undefined') {
    document.cookie =
      `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(state))}` +
      `; path=/; max-age=${ONE_YEAR_SECONDS}; sameSite=lax`;
    // Notify any listeners (banner closes, footer link can re-open).
    window.dispatchEvent(new CustomEvent('amis-consent-changed', { detail: state }));
  }
  return state;
}

export function clearConsent(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; sameSite=lax`;
  window.dispatchEvent(new CustomEvent('amis-consent-changed', { detail: null }));
}
