const formatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
});

export function formatMoneyCents(cents: number): string {
  return formatter.format(cents / 100);
}

/** Tighter display variant for product cards / hero pricing — strips the
 *  whitespace between the € sign and the digit so the price reads as a
 *  single typographic unit. "€10,95" instead of "€ 10,95". */
export function formatMoneyTight(cents: number): string {
  // Intl uses a non-breaking space (U+00A0) between symbol and number
  return formatMoneyCents(cents).replace(/\s/g, '');
}

export function centsFromEuros(euros: number): number {
  return Math.round(euros * 100);
}

export const VAT_RATE_FOOD = 0.09;

export function calculateVatFromGrossCents(grossCents: number, rate = VAT_RATE_FOOD): number {
  return Math.round(grossCents - grossCents / (1 + rate));
}
