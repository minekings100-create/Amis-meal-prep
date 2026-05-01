# AMIS — TODO

Phase 1 (admin core for launch) is complete. The list below tracks what comes next.

---

## Phase 2 — first month after launch

Drop-in improvements once we have real-world usage data and team feedback.

### Orders
- [ ] **Bulk actions on orders** — mark-shipped in batch, batch label PDF generation via Sendcloud, batch refund (the dropdown UI on /admin/orders is wired up; server actions are stubs)
- [ ] **CSV export** — orders, klanten, omzet per maand (download buttons in respective list pages)

### Discounts
- [ ] **Kortingscodes admin pagina** (`/admin/discount-codes`, owner-only) — CRUD + per-code stats (uses, total revenue, abuse detection)

### Activity / audit
- [ ] **Activity logs UI per object** — order_activity_log + product_activity_log already write entries; expose a `<ActivityLog>` panel on product-edit page (orders already has it)

### Real-time / notifications
- [ ] **Real-time order pop-up notifications** — Supabase Realtime channel on `orders` insert event, toast in admin shell with sound + badge
- [ ] **Notificatie bell-icoon** in admin header — count + dropdown listing recent unread (replaces page-load polling)

### Email automation
- [ ] **Daily summary email at 07:00** — Vercel Cron, recipient list from settings.company.email, summary of yesterday's orders + lage voorraad + open refund-requests
- [ ] **Customer email templates editor** — replace hard-coded template names with editable templates stored in DB

### Misc
- [ ] **Server-side image resize via `sharp`** — auto-optimize uploaded product photos to 1200px wide WebP. Currently stored as-is. (See `app/admin/_actions/upload.ts`.)
- [ ] **Inline edit for customer internal note** — currently read-only display on `/admin/customers/[id]`

---

## Phase 3 — as the business scales

Larger investments that aren't urgent but pay off when volume grows.

### Mobile + accessibility
- [ ] **Mobile-optimized admin views** — orders list + status updates are the main candidates; keep desktop-first for everything else
- [ ] **Keyboard shortcuts overlay** — `g+o` orders, `g+p` products, `g+s` stock, `n` new, `/` focus search, `?` show overlay
- [ ] **Onboarding hints / coachmarks** for first-time admin login
- [ ] **Dark mode toggle**
- [ ] **Multi-language admin** — English UI for non-NL staff (admin currently NL-only by design)

### Reporting
- [ ] **Advanced reports** — omzet per categorie, populairste producten, klantsegmenten over time, P&L view, cohort analysis
- [ ] **Print-friendly invoice/receipt PDFs**

### Refunds & after-sales
- [ ] **Partial refund per item** (current refund flow is total-amount only)
- [ ] **Return / exchange flow** with reason tracking

### Subscriptions
- [ ] Subscriptions table exists in schema but no UI yet — admin view + customer self-service portal

---

## Done in Phase 1

- Stap 1 — admin layout, sidebar, role-based auth (owner / staff / customer)
- Stap 2 — dashboard home with stats, 30d trend, recent orders
- Stap 3 — orders listing with tabs / filters / sortable table / bulk-toolbar / tracking-number search
- Stap 4 — order detail with timeline, actions (sendcloud / refund / email / cancel), activity log
- Stap 5 — voorraad management with inline edit + Supabase Realtime + production batch-update dialog
- Stap 6 — products CRUD with 8-section form, dupliceren, soft-delete, image upload, vat_rate (9% / 21%)
- ~~Stap 7 — athletes~~ (scope removed pre-launch)
- Stap 8 — reviews moderation with publish / soft-delete / bulk-publish-5★
- Stap 9 — customers list + detail with stats, history, reviews
- Stap 10 — settings page (owner only) with shipping, company, email, vat, integrations status
- Stap 11 — admin users management with magic-link invite + role inline-edit (owner only)
- Stap 12 — productie planning view (`/admin/kitchen`) + print picklijst
- Stap 13 — webhook log (`/admin/webhooks`, owner only) with filters, JSON details, replay-stub
