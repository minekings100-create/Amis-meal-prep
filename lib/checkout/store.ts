'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street: string;
  house_number: string;
  house_number_addition: string;
  postal_code: string;
  city: string;
  country: string;
  customer_note: string;
}

export interface BillingAddress {
  first_name: string;
  last_name: string;
  street: string;
  house_number: string;
  house_number_addition: string;
  postal_code: string;
  city: string;
  country: string;
}

export type ShippingMethod = 'local' | 'postnl';
export type PaymentMethod = 'ideal' | 'creditcard' | 'klarna' | 'applepay' | 'bancontact';

interface CheckoutState {
  shipping: ShippingAddress;
  billing: BillingAddress;
  giftToOtherAddress: boolean;
  shippingMethod: ShippingMethod | null;
  discountCode: string;
  discountValueCents: number; // 0 if not applied
  paymentMethod: PaymentMethod;
  termsAccepted: boolean;
  setShipping: (patch: Partial<ShippingAddress>) => void;
  setBilling: (patch: Partial<BillingAddress>) => void;
  setGiftToOtherAddress: (v: boolean) => void;
  setShippingMethod: (m: ShippingMethod) => void;
  setDiscountCode: (code: string) => void;
  setDiscount: (code: string, valueCents: number) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  setTermsAccepted: (v: boolean) => void;
  reset: () => void;
}

const emptyShipping: ShippingAddress = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  street: '',
  house_number: '',
  house_number_addition: '',
  postal_code: '',
  city: '',
  country: 'NL',
  customer_note: '',
};

const emptyBilling: BillingAddress = {
  first_name: '',
  last_name: '',
  street: '',
  house_number: '',
  house_number_addition: '',
  postal_code: '',
  city: '',
  country: 'NL',
};

export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      shipping: emptyShipping,
      billing: emptyBilling,
      giftToOtherAddress: false,
      shippingMethod: null,
      discountCode: '',
      discountValueCents: 0,
      paymentMethod: 'ideal',
      termsAccepted: false,
      setShipping: (patch) => set((s) => ({ shipping: { ...s.shipping, ...patch } })),
      setBilling: (patch) => set((s) => ({ billing: { ...s.billing, ...patch } })),
      setGiftToOtherAddress: (v) => set({ giftToOtherAddress: v }),
      setShippingMethod: (m) => set({ shippingMethod: m }),
      setDiscountCode: (code) => set({ discountCode: code }),
      setDiscount: (code, valueCents) => set({ discountCode: code, discountValueCents: valueCents }),
      setPaymentMethod: (m) => set({ paymentMethod: m }),
      setTermsAccepted: (v) => set({ termsAccepted: v }),
      reset: () =>
        set({
          shipping: emptyShipping,
          billing: emptyBilling,
          giftToOtherAddress: false,
          shippingMethod: null,
          discountCode: '',
          discountValueCents: 0,
          paymentMethod: 'ideal',
          termsAccepted: false,
        }),
    }),
    {
      name: 'amis-checkout',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          // SSR no-op storage; persist is browser-only.
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage;
        }
        return sessionStorage;
      }),
    },
  ),
);

const MAASTRICHT_PREFIXES = new Set([
  '6200', '6201', '6202', '6203', '6211', '6212', '6213', '6214', '6215', '6216',
  '6217', '6218', '6219', '6221', '6222', '6223', '6224', '6225', '6226', '6227',
  '6228', '6229',
]);

export function isMaastrichtPostalCode(postalCode: string): boolean {
  const digits = postalCode.replace(/\s+/g, '').slice(0, 4);
  return MAASTRICHT_PREFIXES.has(digits);
}

export const POSTAL_CODE_RE = /^([1-9]\d{3})\s?([A-Z]{2})$/i;
export const PHONE_NL_RE = /^(\+31|0031|0)[1-9]\d{8}$/;
