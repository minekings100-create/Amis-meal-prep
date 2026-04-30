# AMIS Meals

Production e-commerce webshop for AMIS Meals — Dutch high-protein meal prep from Maastricht.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn-style components
- **Database**: Supabase (Postgres + Auth + Storage)
- **Payments**: Mollie (iDEAL, Card, Klarna, Apple Pay, Bancontact)
- **Shipping**: Sendcloud (PostNL labels + automatic track & trace)
- **Email**: Resend
- **i18n**: next-intl (NL default, EN secondary)
- **Forms**: React Hook Form + Zod
- **State**: Server Components first, Zustand for cart only

## Local development

```bash
cp .env.example .env.local   # fill in keys
npm install
npm run dev                  # http://localhost:3000
```

## Project structure

```
app/
├── [locale]/(shop)/          # Public site (NL/EN)
├── admin/                    # Admin dashboard (no i18n)
├── api/webhooks/             # Mollie + Sendcloud webhooks
components/
├── ui/                       # Base components (button, input, ...)
├── shop/                     # Product cards, macro grid, ...
├── checkout/
└── admin/
lib/
├── supabase/                 # Server + client + middleware helpers
├── mollie/                   # Mollie SDK wrapper
├── sendcloud/                # Sendcloud API client
├── resend/                   # Email templates + sender
├── cart/                     # Zustand store
├── i18n/                     # next-intl config
└── utils/                    # Currency, slugs, postcode checks
messages/                     # nl.json, en.json
supabase/
├── migrations/               # SQL migrations (run via Supabase CLI)
└── seed.sql                  # Categories, products, athlete, admin
types/database.ts             # Supabase generated types
```

## Database

Migrations live in `supabase/migrations/`. To apply:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
npx supabase db seed
```

Then regenerate types:

```bash
npm run db:types
```

## Deployment

Deploy to Vercel. Required env vars: see `.env.example`.

After deployment, set webhook URLs in Mollie + Sendcloud dashboards:

- Mollie: `https://amismeals.nl/api/webhooks/mollie`
- Sendcloud: `https://amismeals.nl/api/webhooks/sendcloud`
