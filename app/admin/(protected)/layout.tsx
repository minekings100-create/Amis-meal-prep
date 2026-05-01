import type { Metadata } from 'next';
import { checkAdminAccess } from '@/lib/admin/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: { default: 'AMIS Admin', template: '%s · AMIS Admin' },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await checkAdminAccess('staff');

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminSidebar
        role={ctx.role}
        email={ctx.email}
        firstName={ctx.firstName}
        lastName={ctx.lastName}
        impersonated={ctx.impersonated}
      />
      <div className="pl-60">
        <main className="min-h-screen">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
