-- AMIS Meals — seed data for local dev / first deploy
-- Run after migrations: npx supabase db seed

-- Categories
insert into public.categories (id, slug, name_nl, name_en, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'cut', 'Cut', 'Cut', 1),
  ('11111111-1111-1111-1111-111111111102', 'bulk', 'Bulk', 'Bulk', 2),
  ('11111111-1111-1111-1111-111111111103', 'maintenance', 'Maintenance', 'Maintenance', 3),
  ('11111111-1111-1111-1111-111111111104', 'performance', 'Performance', 'Performance', 4),
  ('11111111-1111-1111-1111-111111111105', 'hybrid', 'Hybrid', 'Hybrid', 5)
on conflict (slug) do nothing;

-- Meals
insert into public.products (
  id, slug, type, name_nl, name_en, description_nl, description_en,
  price_cents, category_id, tags, stock, is_active, is_featured, image_url,
  ingredients_nl, ingredients_en, kcal, protein_g, carbs_g, fat_g, fiber_g, salt_g,
  contains_gluten, contains_soy
) values
  (
    '22222222-2222-2222-2222-222222222201', 'korean-beef-bowl', 'meal',
    'Korean Beef Bowl', 'Korean Beef Bowl',
    'Mager rundvlees in een licht-pittige Koreaanse marinade met basmati, edamame en kimchi.',
    'Lean beef in a light-spiced Korean marinade with basmati, edamame and kimchi.',
    1095, '11111111-1111-1111-1111-111111111103',
    array['high-protein','spicy'], 50, true, true,
    'https://placehold.co/800x800/4a8a3c/ffffff/png?text=Korean+Beef',
    'Rundvlees, basmati rijst, edamame, kimchi, sojasaus, knoflook, gember, sesamolie',
    'Beef, basmati rice, edamame, kimchi, soy sauce, garlic, ginger, sesame oil',
    580, 42, 58, 18, 6, 1.8, true, true
  ),
  (
    '22222222-2222-2222-2222-222222222202', 'sweet-potato-salmon', 'meal',
    'Sweet Potato Salmon', 'Sweet Potato Salmon',
    'Atlantische zalm met geroosterde zoete aardappel, broccolini en citroen-dille saus.',
    'Atlantic salmon with roasted sweet potato, broccolini and lemon-dill sauce.',
    1250, '11111111-1111-1111-1111-111111111104',
    array['high-protein','omega-3','glutenvrij'], 40, true, true,
    'https://placehold.co/800x800/7cc24f/ffffff/png?text=Salmon',
    'Zalm, zoete aardappel, broccolini, citroen, dille, olijfolie, knoflook',
    'Salmon, sweet potato, broccolini, lemon, dill, olive oil, garlic',
    620, 38, 52, 24, 8, 1.2, false, false
  ),
  (
    '22222222-2222-2222-2222-222222222203', 'mexican-chicken-bowl', 'meal',
    'Mexican Chicken Bowl', 'Mexican Chicken Bowl',
    'Gegrilde kipfilet met zwarte bonen, mais, paprika, bruine rijst en chipotle saus.',
    'Grilled chicken with black beans, corn, peppers, brown rice and chipotle sauce.',
    1095, '11111111-1111-1111-1111-111111111101',
    array['high-protein','spicy'], 60, true, true,
    'https://placehold.co/800x800/4a8a3c/ffffff/png?text=Mexican+Chicken',
    'Kipfilet, zwarte bonen, mais, paprika, bruine rijst, chipotle, koriander, limoen',
    'Chicken breast, black beans, corn, bell pepper, brown rice, chipotle, cilantro, lime',
    540, 45, 56, 12, 9, 1.4, false, false
  )
on conflict (slug) do nothing;

-- 7-day cut package
insert into public.products (
  id, slug, type, name_nl, name_en, description_nl, description_en,
  price_cents, compare_at_price_cents, category_id, tags, stock, is_active, is_featured, image_url
) values
  (
    '33333333-3333-3333-3333-333333333301', '7-dagen-cut-pakket', 'package',
    '7-dagen Cut Pakket', '7-day Cut Package',
    'Zeven maaltijden, samengesteld voor een rustige cut. Hoge eiwitten, gecontroleerde calorieën.',
    'Seven meals built for a calm cut. High protein, controlled calories.',
    6950, 7665, '11111111-1111-1111-1111-111111111101',
    array['cut','high-protein','7-meals'], 25, true, true,
    'https://placehold.co/800x800/131613/ffffff/png?text=Cut+Pakket'
  ),
  -- Tryout
  (
    '33333333-3333-3333-3333-333333333302', 'amis-kennismakingspakket', 'tryout',
    'AMIS Kennismakingspakket', 'AMIS Try-out Box',
    'Drie van onze populairste maaltijden. Eenmalig per klant. Proef AMIS zonder verbintenis.',
    'Three of our most popular meals. One per customer. Taste AMIS, no strings.',
    3495, 3935, '11111111-1111-1111-1111-111111111103',
    array['tryout','3-meals'], 100, true, true,
    'https://placehold.co/800x800/4a8a3c/ffffff/png?text=Tryout+Box'
  ),
  -- Bulk package for athlete
  (
    '33333333-3333-3333-3333-333333333303', '7-dagen-bulk-pakket', 'package',
    '7-dagen Bulk Pakket', '7-day Bulk Package',
    'Zeven maaltijden voor groei. Hoge calorieën, hoog eiwit, complexe koolhydraten.',
    'Seven meals for growth. High calories, high protein, complex carbs.',
    7950, null, '11111111-1111-1111-1111-111111111102',
    array['bulk','high-protein','7-meals'], 20, true, false,
    'https://placehold.co/800x800/131613/ffffff/png?text=Bulk+Pakket'
  )
on conflict (slug) do nothing;

-- Package items (cut pakket = mix of meals)
insert into public.package_items (package_id, meal_id, quantity, sort_order) values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 2, 1),
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222202', 2, 2),
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222203', 3, 3),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 1, 1),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', 1, 2),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222203', 1, 3),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 3, 1),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222202', 2, 2),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222203', 2, 3)
on conflict do nothing;

-- Athlete
insert into public.athletes (id, slug, name, sport, goal, bio_nl, bio_en, portrait_url, package_id, is_active, sort_order) values
  (
    '44444444-4444-4444-4444-444444444401',
    'pieter-de-vries',
    'Pieter de Vries',
    'Powerlifting',
    'bulk',
    'Pieter is een Limburgse krachtsporter die werkt aan zijn volgende squat-PR. Zijn weekmenu is opgebouwd voor een gecontroleerd growth-traject — hoog in eiwit en complexe koolhydraten.',
    'Pieter is a Limburg-based powerlifter chasing his next squat PR. His weekly menu is built for controlled growth — high in protein and complex carbs.',
    'https://placehold.co/800x1000/131613/ffffff/png?text=Pieter',
    '33333333-3333-3333-3333-333333333303',
    true, 1
  )
on conflict (slug) do nothing;

-- Sample discount code (10% off, min order €30)
insert into public.discount_codes (code, type, value_cents, value_percent, min_order_cents, max_uses_per_customer, is_active) values
  ('WELCOME10', 'percentage', 0, 10, 3000, 1, true)
on conflict (code) do nothing;
