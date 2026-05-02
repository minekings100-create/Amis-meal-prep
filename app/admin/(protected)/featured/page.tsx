import { checkAdminAccess } from '@/lib/admin/auth';
import { getFeaturedListing } from '@/lib/admin/featured';
import { FeaturedManager } from '@/components/admin/featured/featured-manager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hot deze week' };

export default async function FeaturedAdminPage() {
  await checkAdminAccess('staff');
  const listing = await getFeaturedListing();

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-[-0.025em]">Hot deze week</h1>
        <p className="text-stone-600 mt-1 text-sm">
          Beheer de drie maaltijden die op de homepage uitgelicht worden. Sleep om de volgorde
          te wijzigen.
        </p>
        {listing.isMocked && (
          <p className="text-amber-700 text-xs mt-2 font-mono">
            demo mode — wijzigingen worden niet opgeslagen tot Supabase actief is
          </p>
        )}
      </header>
      <FeaturedManager available={listing.available} selected={listing.selected} />
    </div>
  );
}
