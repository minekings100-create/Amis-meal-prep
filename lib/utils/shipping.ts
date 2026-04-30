import { isLocalDeliveryPostalCode } from './postcode';

export type ShippingMethod = 'postnl' | 'local';

export interface ShippingOption {
  method: ShippingMethod;
  feeCents: number;
  isFree: boolean;
  freeThresholdCents: number;
  label: string;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function getAvailableShippingOptions(
  postalCode: string | null,
  subtotalCents: number,
): ShippingOption[] {
  const postnlFee = intEnv('POSTNL_SHIPPING_FEE_CENTS', 695);
  const postnlThreshold = intEnv('FREE_POSTNL_THRESHOLD_CENTS', 6000);
  const localFee = intEnv('LOCAL_DELIVERY_FEE_CENTS', 395);
  const localThreshold = intEnv('FREE_LOCAL_DELIVERY_THRESHOLD_CENTS', 4000);

  const postnlIsFree = subtotalCents >= postnlThreshold;
  const options: ShippingOption[] = [
    {
      method: 'postnl',
      feeCents: postnlIsFree ? 0 : postnlFee,
      isFree: postnlIsFree,
      freeThresholdCents: postnlThreshold,
      label: 'PostNL bezorging',
    },
  ];

  if (postalCode && isLocalDeliveryPostalCode(postalCode)) {
    const localIsFree = subtotalCents >= localThreshold;
    options.unshift({
      method: 'local',
      feeCents: localIsFree ? 0 : localFee,
      isFree: localIsFree,
      freeThresholdCents: localThreshold,
      label: 'Lokale bezorging Maastricht',
    });
  }

  return options;
}
