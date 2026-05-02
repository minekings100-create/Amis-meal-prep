'use client';

import { useState } from 'react';
import { ExternalLink, Sun, Moon } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import { ProductCard } from '@/components/shop/product-card';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/database';
import type { ProductFormPayload } from '@/app/admin/_actions/products';
import nlMessages from '@/messages/nl.json';

/** Builds a Product-shaped object from the live form state so the real
 *  shop ProductCard can render it as a preview. */
function toProduct(state: ProductFormPayload): Product {
  return {
    id: 'preview',
    slug: state.slug || 'preview',
    name_nl: state.name_nl || 'Productnaam',
    name_en: state.name_en || 'Product name',
    description_nl: state.description_nl,
    description_en: state.description_en,
    type: state.type,
    category_id: state.category_id,
    is_active: state.is_active,
    is_featured: state.is_featured,
    price_cents: state.price_cents,
    compare_at_price_cents: state.compare_at_price_cents,
    stock: state.stock,
    vat_rate: state.vat_rate,
    goal_tag: state.goal_tag,
    attribute_tags: state.attribute_tags as Product['attribute_tags'],
    image_url: state.image_url,
    gallery_urls: state.gallery_urls,
    kcal: state.kcal,
    protein_g: state.protein_g,
    carbs_g: state.carbs_g,
    fat_g: state.fat_g,
    fiber_g: state.fiber_g,
    salt_g: state.salt_g,
    ingredients_nl: state.ingredients_nl,
    ingredients_en: state.ingredients_en,
    contains_gluten: state.contains_gluten,
    contains_lactose: state.contains_lactose,
    contains_nuts: state.contains_nuts,
    contains_eggs: state.contains_eggs,
    contains_soy: state.contains_soy,
    contains_fish: state.contains_fish,
    contains_shellfish: state.contains_shellfish,
    contains_sesame: state.contains_sesame,
    contains_celery: state.contains_celery,
    contains_mustard: state.contains_mustard,
    contains_lupine: state.contains_lupine,
    contains_sulfite: state.contains_sulfite,
    contains_mollusks: state.contains_mollusks,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Product;
}

interface ProductPreviewProps {
  state: ProductFormPayload;
  /** Product slug for the "Preview op shop" link; only shown when editing. */
  publishedSlug?: string;
}

export function ProductPreview({ state, publishedSlug }: ProductPreviewProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const product = toProduct(state);

  return (
    <aside className="sticky top-24 self-start">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        {/* Header: eyebrow + theme toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
            Live preview
          </p>
          <div className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 p-0.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
              title="Licht"
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                theme === 'light'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800',
              )}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              title="Donker"
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                theme === 'dark'
                  ? 'bg-(--color-brand-black) text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800',
              )}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Preview surface — wraps the real ProductCard inside a NextIntlClient
            provider (admin doesn't ship one) and a `.dark` scope for the
            dark theme. The pointer-events-none keeps the customer-side
            buttons inert in admin context. */}
        <NextIntlClientProvider locale="nl" messages={nlMessages}>
          <div
            className={cn(
              'rounded-xl p-4 transition-colors',
              theme === 'dark' ? 'dark bg-(--color-bg)' : 'bg-stone-50',
            )}
          >
            <div className="pointer-events-none">
              <ProductCard product={product} />
            </div>
          </div>
        </NextIntlClientProvider>

        {publishedSlug && (
          <a
            href={`/shop/${publishedSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900"
          >
            <ExternalLink className="h-3 w-3" /> Preview op shop
          </a>
        )}
      </div>
    </aside>
  );
}
