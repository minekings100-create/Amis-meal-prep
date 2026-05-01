'use server';

import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const BUCKET = 'product-images';

export interface UploadResult {
  ok: boolean;
  url?: string;
  message?: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Upload product image to Supabase Storage bucket 'product-images'.
 *
 * TODO: server-side resize via sharp once added as a dependency. For now the
 * uploaded image is stored as-is. The bucket should have a public-read policy.
 * Caller is responsible for image dimensions / quality in the meantime.
 */
export async function uploadProductImageAction(formData: FormData): Promise<UploadResult> {
  await checkAdminAccess('staff');

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, message: 'Geen bestand ontvangen' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: 'Bestand groter dan 5 MB' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: 'Alleen JPG, PNG of WebP toegestaan' };
  }

  if (!isSupabaseConfigured()) {
    // Dev fallback: return a deterministic placeholder URL so the UI flow stays testable.
    return {
      ok: true,
      url: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=1200&fit=crop&seed=${Date.now()}`,
    };
  }

  const sb = createServiceRoleClient();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: false });
  if (error) return { ok: false, message: error.message };

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(filename);
  return { ok: true, url: pub.publicUrl };
}
