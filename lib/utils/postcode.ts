function getLocalPrefixes(): string[] {
  const raw = process.env.LOCAL_DELIVERY_POSTAL_CODES ?? '';
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

export function isLocalDeliveryPostalCode(postalCode: string): boolean {
  const normalized = postalCode.replace(/\s+/g, '').toUpperCase();
  const digitsOnly = normalized.replace(/[A-Z]/g, '').slice(0, 4);
  if (digitsOnly.length !== 4) return false;
  const prefixes = getLocalPrefixes();
  return prefixes.includes(digitsOnly);
}

const DUTCH_POSTAL_RE = /^([1-9]\d{3})\s?[A-Z]{2}$/i;

export function isValidDutchPostalCode(postalCode: string): boolean {
  return DUTCH_POSTAL_RE.test(postalCode.trim());
}

export function normalizeDutchPostalCode(postalCode: string): string {
  const trimmed = postalCode.trim().toUpperCase().replace(/\s+/g, '');
  if (trimmed.length === 6) return `${trimmed.slice(0, 4)} ${trimmed.slice(4)}`;
  return trimmed;
}
