/**
 * Hand-written Database types matching supabase/migrations/*.
 * Replace by running: npm run db:types  (requires linked Supabase project).
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ProductType = 'meal' | 'package' | 'tryout';
export type GoalTag = 'cut' | 'bulk' | 'performance' | 'maintenance' | 'hybrid';
export type AttributeTag =
  | 'new'
  | 'bestseller'
  | 'limited'
  | 'spicy'
  | 'high-protein'
  | 'vegetarian'
  | 'gluten-free'
  | 'lactose-free';
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type ShippingMethod = 'postnl' | 'local';
export type UserRole = 'customer' | 'staff' | 'owner';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: UserRole;
          has_used_tryout: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          type: 'shipping' | 'billing';
          street: string;
          house_number: string;
          postal_code: string;
          city: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['addresses']['Row']>;
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_nl: string;
          name_en: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          type: ProductType;
          name_nl: string;
          name_en: string;
          description_nl: string | null;
          description_en: string | null;
          price_cents: number;
          compare_at_price_cents: number | null;
          category_id: string | null;
          tags: string[];
          goal_tag: GoalTag | null;
          attribute_tags: AttributeTag[];
          stock: number;
          is_active: boolean;
          is_featured: boolean;
          image_url: string | null;
          gallery_urls: string[];
          ingredients_nl: string | null;
          ingredients_en: string | null;
          kcal: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          fiber_g: number | null;
          salt_g: number | null;
          contains_gluten: boolean;
          contains_lactose: boolean;
          contains_nuts: boolean;
          contains_eggs: boolean;
          contains_soy: boolean;
          contains_fish: boolean;
          contains_shellfish: boolean;
          contains_sesame: boolean;
          contains_celery: boolean;
          contains_mustard: boolean;
          contains_lupine: boolean;
          contains_sulfite: boolean;
          contains_mollusks: boolean;
          vat_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          slug: string;
          type: ProductType;
          name_nl: string;
          name_en: string;
          price_cents: number;
        };
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      package_items: {
        Row: {
          id: string;
          package_id: string;
          meal_id: string;
          quantity: number;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['package_items']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['package_items']['Row']>;
      };
      discount_codes: {
        Row: {
          id: string;
          code: string;
          type: 'percentage' | 'fixed';
          value_cents: number;
          value_percent: number;
          min_order_cents: number;
          max_uses_total: number | null;
          max_uses_per_customer: number;
          uses_count: number;
          valid_from: string | null;
          valid_until: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['discount_codes']['Row']> & {
          code: string;
          type: 'percentage' | 'fixed';
        };
        Update: Partial<Database['public']['Tables']['discount_codes']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          guest_email: string | null;
          status: OrderStatus;
          subtotal_cents: number;
          discount_cents: number;
          shipping_cents: number;
          tax_cents: number;
          total_cents: number;
          shipping_method: ShippingMethod;
          shipping_first_name: string;
          shipping_last_name: string;
          shipping_street: string;
          shipping_house_number: string;
          shipping_postal_code: string;
          shipping_city: string;
          shipping_country: string;
          shipping_phone: string | null;
          mollie_payment_id: string | null;
          mollie_payment_status: string | null;
          sendcloud_parcel_id: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
          discount_code_id: string | null;
          customer_note: string | null;
          internal_note: string | null;
          created_at: string;
          paid_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['orders']['Row']> & {
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          shipping_method: ShippingMethod;
          shipping_first_name: string;
          shipping_last_name: string;
          shipping_street: string;
          shipping_house_number: string;
          shipping_postal_code: string;
          shipping_city: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price_cents: number;
          total_cents: number;
          vat_rate: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Row']>;
      };
      discount_code_uses: {
        Row: {
          id: string;
          discount_code_id: string;
          order_id: string;
          user_id: string | null;
          used_at: string;
        };
        Insert: Omit<Database['public']['Tables']['discount_code_uses']['Row'], 'id' | 'used_at'> & {
          id?: string;
          used_at?: string;
        };
        Update: Partial<Database['public']['Tables']['discount_code_uses']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_id: string | null;
          rating: number;
          title: string | null;
          body: string | null;
          is_published: boolean;
          is_deleted: boolean;
          deleted_reason: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reviews']['Row']> & {
          product_id: string;
          user_id: string;
          rating: number;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          frequency: 'weekly' | 'biweekly';
          status: 'active' | 'paused' | 'cancelled';
          next_delivery_date: string | null;
          mollie_mandate_id: string | null;
          created_at: string;
          cancelled_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & {
          user_id: string;
          package_id: string;
          frequency: 'weekly' | 'biweekly';
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_owner: { Args: Record<string, never>; Returns: boolean };
      decrement_stock: { Args: { p_product_id: string; p_quantity: number }; Returns: boolean };
      generate_order_number: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience aliases
export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type DiscountCode = Database['public']['Tables']['discount_codes']['Row'];
export type PackageItem = Database['public']['Tables']['package_items']['Row'];
