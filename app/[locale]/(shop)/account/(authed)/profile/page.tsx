import { requireCustomer } from '@/lib/account/auth';
import { ProfileForm } from '@/components/account/profile-form';

export const metadata = { title: 'Profiel' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const customer = await requireCustomer('/account/profile');
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em]">Profiel</h1>
        <p className="text-stone-600 mt-1 text-sm">Beheer je gegevens en voorkeuren.</p>
      </header>
      <ProfileForm customer={customer} />
    </div>
  );
}
