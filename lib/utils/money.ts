const formatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
});

export function formatMoneyCents(cents: number): string {
  return formatter.format(cents / 100);
}

export function centsFromEuros(euros: number): number {
  return Math.round(euros * 100);
}

export const VAT_RATE_FOOD = 0.09;

export function calculateVatFromGrossCents(grossCents: number, rate = VAT_RATE_FOOD): number {
  return Math.round(grossCents - grossCents / (1 + rate));
}
