import { checkAdminAccess } from '@/lib/admin/auth';
import { getAllSettings, getIntegrationStatus } from '@/lib/admin/settings';
import {
  ShippingCard,
  CompanyCard,
  EmailCard,
  GeneralCard,
  IntegrationsCard,
} from '@/components/admin/settings/settings-cards';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Instellingen' };

export default async function SettingsPage() {
  await checkAdminAccess('owner');
  const { settings, isMocked } = await getAllSettings();
  const integrations = getIntegrationStatus();

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-5">
      <header className="mb-2">
        <h1 className="text-3xl font-bold tracking-[-0.025em]">Instellingen</h1>
        <p className="text-stone-600 mt-1 text-sm">
          Owner-only.
          {isMocked && (
            <span className="text-amber-700 ml-2">(demo data — Supabase niet verbonden, opslaan is no-op)</span>
          )}
        </p>
      </header>

      <ShippingCard initial={settings.shipping} />
      <CompanyCard initial={settings.company} />
      <EmailCard initial={settings.email} />
      <IntegrationsCard status={integrations} />
      <GeneralCard initial={settings.general} />
    </div>
  );
}
