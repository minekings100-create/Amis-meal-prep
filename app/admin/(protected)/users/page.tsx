import { checkAdminAccess } from '@/lib/admin/auth';
import { listAdminUsers } from '@/lib/admin/users';
import { UsersTable } from '@/components/admin/users/users-table';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gebruikers' };

export default async function UsersPage() {
  const ctx = await checkAdminAccess('owner');
  const { rows, isMocked } = await listAdminUsers();

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-[-0.025em]">Gebruikers</h1>
        <p className="text-stone-600 mt-1 text-sm">
          Owner-only. Beheer admin-rollen en nodig nieuwe team-members uit.
          {isMocked && <span className="text-amber-700 ml-2">(demo data)</span>}
        </p>
      </header>

      <UsersTable initialRows={rows} currentUserId={ctx.userId} />
    </div>
  );
}
