'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Trash2, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { centsFromEuros } from '@/lib/utils/money';
import { MainImageUpload, GalleryUpload } from './image-upload';
import { PackageItemsSection, type MealOption } from './package-items';
import {
  createProductAction,
  updateProductAction,
  duplicateProductAction,
  softDeleteProductAction,
  type ProductFormPayload,
} from '@/app/admin/_actions/products';
import { ATTRIBUTE_TAGS, GOAL_TAGS, ALLERGEN_FIELDS } from '@/lib/admin/shared';
import type { Category } from '@/types/database';

const GOAL_COLORS: Record<(typeof GOAL_TAGS)[number], string> = {
  cut: 'bg-blue-50 text-blue-800 border-blue-200',
  bulk: 'bg-orange-50 text-orange-800 border-orange-200',
  performance: 'bg-purple-50 text-purple-800 border-purple-200',
  maintenance: 'bg-stone-50 text-stone-800 border-stone-200',
  hybrid: 'bg-[--color-accent-bright]/15 text-[--color-accent] border-[--color-accent-bright]/30',
};

const GOAL_LABELS: Record<(typeof GOAL_TAGS)[number], string> = {
  cut: 'Cut',
  bulk: 'Bulk',
  performance: 'Performance',
  maintenance: 'Onderhoud',
  hybrid: 'Hybrid',
};

const ATTR_LABELS: Record<string, string> = {
  'new': 'Nieuw',
  'bestseller': 'Bestseller',
  'limited': 'Limited',
  'spicy': 'Pittig',
  'high-protein': 'High protein',
  'vegetarian': 'Vegetarisch',
  'gluten-free': 'Glutenvrij',
  'lactose-free': 'Lactosevrij',
};

type FormState = ProductFormPayload;

function defaultState(): FormState {
  return {
    slug: '',
    name_nl: '',
    name_en: '',
    description_nl: null,
    description_en: null,
    type: 'meal',
    category_id: null,
    is_active: true,
    is_featured: false,
    price_cents: 0,
    compare_at_price_cents: null,
    stock: 0,
    vat_rate: 9,
    goal_tag: null,
    attribute_tags: [],
    image_url: null,
    gallery_urls: [],
    kcal: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
    fiber_g: null,
    salt_g: null,
    ingredients_nl: null,
    ingredients_en: null,
    contains_gluten: false,
    contains_lactose: false,
    contains_nuts: false,
    contains_eggs: false,
    contains_soy: false,
    contains_fish: false,
    contains_shellfish: false,
    contains_sesame: false,
    contains_celery: false,
    contains_mustard: false,
    contains_lupine: false,
    contains_sulfite: false,
    contains_mollusks: false,
    package_items: [],
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function ProductForm({
  productId,
  initial,
  categories,
  meals,
}: {
  productId?: string;
  initial?: Partial<FormState>;
  categories: Category[];
  meals: MealOption[];
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    ...defaultState(),
    ...initial,
  });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initial?.slug));

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onNameChange(value: string) {
    patch('name_nl', value);
    if (!slugManuallyEdited) patch('slug', slugify(value));
  }

  function priceEur(cents: number): string {
    return cents > 0 ? (cents / 100).toFixed(2) : '';
  }

  function setPriceEur(value: string) {
    patch('price_cents', value ? centsFromEuros(parseFloat(value)) : 0);
  }

  function setCompareEur(value: string) {
    patch('compare_at_price_cents', value ? centsFromEuros(parseFloat(value)) : null);
  }

  function toggleAttr(tag: string) {
    const has = state.attribute_tags.includes(tag);
    patch('attribute_tags', has ? state.attribute_tags.filter((t) => t !== tag) : [...state.attribute_tags, tag]);
  }

  async function submit() {
    setError(null);
    if (!state.name_nl.trim() || !state.name_en.trim()) {
      setError('Naam NL en EN zijn verplicht');
      return;
    }
    if (!state.slug.trim()) {
      setError('Slug is verplicht');
      return;
    }
    start(async () => {
      const res = productId
        ? await updateProductAction(productId, state)
        : await createProductAction(state);
      if (!res.ok) {
        setError(res.message ?? 'Onbekende fout');
        return;
      }
      if (!productId && res.productId) {
        router.replace(`/admin/products/${res.productId}/edit`);
      }
    });
  }

  async function duplicate() {
    if (!productId) return;
    start(async () => {
      const res = await duplicateProductAction(productId);
      if (res.ok && res.productId) router.push(`/admin/products/${res.productId}/edit`);
    });
  }

  async function softDelete() {
    if (!productId) return;
    start(async () => {
      const res = await softDeleteProductAction(productId);
      if (res.ok) router.push('/admin/products');
    });
  }

  return (
    <div className="pb-32">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <Link href="/admin" className="hover:text-stone-900">Admin</Link>
          <span>/</span>
          <Link href="/admin/products" className="hover:text-stone-900">Producten</Link>
          <span>/</span>
          <span className="text-stone-700 truncate max-w-[200px]">
            {productId ? state.name_nl || '(naamloos)' : 'Nieuw product'}
          </span>
        </div>
        {productId && (
          <div className="flex gap-2">
            <Link
              href={`/shop/${state.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-stone-200 bg-white text-xs hover:bg-stone-50"
            >
              <ExternalLink className="h-3 w-3" /> Naar shop
            </Link>
            <button
              type="button"
              onClick={duplicate}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-stone-200 bg-white text-xs hover:bg-stone-50"
            >
              <Copy className="h-3 w-3" /> Dupliceren
            </button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Section 1 — Algemeen */}
        <Section title="1. Algemeen">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Naam NL *">
              <Input value={state.name_nl} onChange={(v) => onNameChange(v)} />
            </Field>
            <Field label="Naam EN *">
              <Input value={state.name_en} onChange={(v) => patch('name_en', v)} />
            </Field>
            <Field label="Slug *" hint="Auto-gegenereerd uit naam, kun je aanpassen">
              <Input
                value={state.slug}
                onChange={(v) => {
                  patch('slug', v);
                  setSlugManuallyEdited(true);
                }}
                mono
              />
            </Field>
            <Field label="Categorie">
              <select
                value={state.category_id ?? ''}
                onChange={(e) => patch('category_id', e.target.value || null)}
                className="h-10 w-full px-3 rounded-md border border-stone-200 bg-white text-sm"
              >
                <option value="">— geen —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_nl}</option>
                ))}
              </select>
            </Field>
            <Field label="Beschrijving NL">
              <Textarea value={state.description_nl ?? ''} onChange={(v) => patch('description_nl', v || null)} />
            </Field>
            <Field label="Beschrijving EN">
              <Textarea value={state.description_en ?? ''} onChange={(v) => patch('description_en', v || null)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs font-medium text-stone-700 mb-2">Type *</p>
              <div className="flex gap-2">
                {(['meal', 'package', 'tryout'] as const).map((t) => (
                  <label
                    key={t}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-md border cursor-pointer text-sm capitalize transition-colors',
                      state.type === t ? 'border-[--color-accent] bg-[--color-accent-bright]/10 text-[--color-accent] font-medium' : 'border-stone-200 bg-white hover:bg-stone-50',
                    )}
                  >
                    <input
                      type="radio"
                      name="type"
                      checked={state.type === t}
                      onChange={() => patch('type', t)}
                      className="sr-only"
                    />
                    {t === 'meal' ? 'Maaltijd' : t === 'package' ? 'Pakket' : 'Tryout'}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-6">
              <Toggle label="Actief" checked={state.is_active} onChange={(v) => patch('is_active', v)} />
              <Toggle label="Featured (Hot deze week)" checked={state.is_featured} onChange={(v) => patch('is_featured', v)} />
            </div>
          </div>
        </Section>

        {/* Section 2 — Prijs en voorraad */}
        <Section title="2. Prijs en voorraad">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="Prijs (€) *">
              <Input value={priceEur(state.price_cents)} onChange={setPriceEur} mono type="number" step="0.01" />
            </Field>
            <Field label="Was-prijs (€)" hint="Voor strike-through (optioneel)">
              <Input
                value={state.compare_at_price_cents != null ? (state.compare_at_price_cents / 100).toFixed(2) : ''}
                onChange={setCompareEur}
                mono
                type="number"
                step="0.01"
              />
            </Field>
            <Field label="BTW-tarief">
              <select
                value={state.vat_rate}
                onChange={(e) => patch('vat_rate', parseFloat(e.target.value))}
                className="h-10 w-full px-3 rounded-md border border-stone-200 bg-white text-sm font-mono"
              >
                <option value={9}>9% (food)</option>
                <option value={21}>21% (cadeaubon / non-food)</option>
              </select>
            </Field>
            <Field label="Voorraad">
              <Input value={String(state.stock)} onChange={(v) => patch('stock', parseInt(v, 10) || 0)} mono type="number" />
            </Field>
          </div>
        </Section>

        {/* Section 3 — Beelden */}
        <Section title="3. Beelden">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-stone-700 mb-2">Hoofdafbeelding</p>
              <MainImageUpload value={state.image_url} onChange={(url) => patch('image_url', url)} />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700 mb-2">Galerij</p>
              <GalleryUpload value={state.gallery_urls} onChange={(urls) => patch('gallery_urls', urls)} />
            </div>
          </div>
        </Section>

        {/* Section 4 — Tags */}
        <Section title="4. Tags">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-stone-700 mb-2">Goal tag</p>
              <div className="flex flex-wrap gap-2">
                <RadioPill
                  label="— geen —"
                  className="bg-white text-stone-500 border-stone-200"
                  active={state.goal_tag === null}
                  onClick={() => patch('goal_tag', null)}
                />
                {GOAL_TAGS.map((g) => (
                  <RadioPill
                    key={g}
                    label={GOAL_LABELS[g]}
                    className={GOAL_COLORS[g]}
                    active={state.goal_tag === g}
                    onClick={() => patch('goal_tag', g)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700 mb-2">Attribute tags</p>
              <div className="flex flex-wrap gap-2">
                {ATTRIBUTE_TAGS.map((t) => {
                  const checked = state.attribute_tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleAttr(t)}
                      className={cn(
                        'inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium',
                        checked
                          ? 'border-[--color-accent] bg-[--color-accent-bright]/15 text-[--color-accent]'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50',
                      )}
                    >
                      {ATTR_LABELS[t] ?? t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Section 5 — Voedingswaarden */}
        <Section title="5. Voedingswaarden (per portie)">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {([
              { key: 'kcal', label: 'kcal' },
              { key: 'protein_g', label: 'Eiwit (g)' },
              { key: 'carbs_g', label: 'Koolh. (g)' },
              { key: 'fat_g', label: 'Vet (g)' },
              { key: 'fiber_g', label: 'Vezels (g)' },
              { key: 'salt_g', label: 'Zout (g)' },
            ] as const).map((m) => (
              <Field key={m.key} label={m.label}>
                <Input
                  value={state[m.key] != null ? String(state[m.key]) : ''}
                  onChange={(v) => patch(m.key, v ? parseFloat(v) : null)}
                  mono
                  type="number"
                  step="0.1"
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* Section 6 — Allergenen */}
        <Section title="6. Allergenen">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
            {ALLERGEN_FIELDS.map((a) => (
              <label
                key={a.key}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-stone-200 hover:bg-stone-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={state[a.key as keyof FormState] as boolean}
                  onChange={(e) => patch(a.key as keyof FormState, e.target.checked as never)}
                  className="h-4 w-4 rounded border-stone-300 text-[--color-accent]"
                />
                <span className="text-sm text-stone-700">{a.label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Section 7 — Ingrediënten */}
        <Section title="7. Ingrediënten">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Ingrediënten NL" hint="Comma-separated">
              <Textarea
                value={state.ingredients_nl ?? ''}
                onChange={(v) => patch('ingredients_nl', v || null)}
                rows={4}
              />
            </Field>
            <Field label="Ingrediënten EN" hint="Comma-separated">
              <Textarea
                value={state.ingredients_en ?? ''}
                onChange={(v) => patch('ingredients_en', v || null)}
                rows={4}
              />
            </Field>
          </div>
        </Section>

        {/* Section 8 — Pakket-samenstelling */}
        {state.type === 'package' && (
          <Section title="8. Pakket samenstelling">
            <PackageItemsSection
              items={state.package_items ?? []}
              onChange={(items) => patch('package_items', items)}
              meals={meals}
            />
          </Section>
        )}

        {/* Soft delete */}
        {productId && (
          <Section title="Gevarenzone" tone="danger">
            {showDelete ? (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 space-y-3">
                <p className="text-sm text-red-900">
                  Soft delete: zet <span className="font-mono">is_active=false</span>. Product is niet meer zichtbaar in shop maar oude orders behouden hun referentie.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDelete(false)}
                    className="h-9 px-4 rounded-md border border-stone-300 bg-white text-sm hover:bg-stone-50"
                  >
                    Annuleren
                  </button>
                  <button
                    type="button"
                    onClick={softDelete}
                    disabled={pending}
                    className="h-9 px-4 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                  >
                    {pending ? 'Verwijderen…' : 'Bevestig verwijderen'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-red-200 bg-white text-sm text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Verwijder product
              </button>
            )}
          </Section>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-60 right-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between gap-4">
          {error ? (
            <span className="text-sm text-red-600">{error}</span>
          ) : (
            <span className="text-xs text-stone-500">Wijzigingen worden opgeslagen wanneer je op bewaren klikt.</span>
          )}
          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="h-10 px-4 inline-flex items-center rounded-md border border-stone-200 text-sm hover:bg-stone-50"
            >
              Annuleren
            </Link>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-md bg-[--color-accent] text-white font-semibold text-sm hover:bg-[--color-accent]/90 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {pending ? 'Opslaan…' : productId ? 'Bewaar wijzigingen' : 'Product aanmaken'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Field primitives
// ============================================================
function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: 'danger' }) {
  return (
    <section className={cn(
      'rounded-2xl border bg-white p-6',
      tone === 'danger' ? 'border-red-200' : 'border-stone-200',
    )}>
      <h2 className={cn('text-sm font-bold uppercase tracking-wider mb-4', tone === 'danger' ? 'text-red-700' : 'text-stone-500')}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-700 mb-1">
        {label}
        {hint && <span className="text-stone-400 font-normal ml-1.5">— {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
  step,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-10 w-full px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-[--color-accent] focus:ring-2 focus:ring-[--color-accent-bright]/30',
        mono && 'font-mono tabular-nums',
      )}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-3 py-2 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-[--color-accent] focus:ring-2 focus:ring-[--color-accent-bright]/30"
    />
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-[--color-accent]' : 'bg-stone-300',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </button>
      <span className="text-sm text-stone-700">{label}</span>
    </label>
  );
}

function RadioPill({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 h-8 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all',
        active ? `${className} ring-2 ring-offset-1 ring-[--color-accent]` : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300',
      )}
    >
      {label}
    </button>
  );
}
