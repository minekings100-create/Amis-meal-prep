import { Plus, MapPin } from 'lucide-react';
import { requireCustomer } from '@/lib/account/auth';

export const metadata = { title: 'Adressen' };
export const dynamic = 'force-dynamic';

export default async function AddressesPage() {
  await requireCustomer('/account/addresses');
  // Stub: addresses CRUD lives in Phase 2 — for now show the structure with a placeholder default.
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em]">Adressen</h1>
        <p className="text-stone-600 mt-1 text-sm">Beheer je opgeslagen bezorg- en factuuradressen.</p>
      </header>

      <div className="space-y-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-(--color-accent) shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-stone-900">Thuis</p>
              <span className="text-[10px] uppercase tracking-wider font-bold text-(--color-accent) bg-(--color-accent-bright)/15 px-2 py-0.5 rounded-full">
                Standaard
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Sanne van Loon
              <br />
              Wycker Brugstraat 12B
              <br />
              <span className="font-mono">6221 ED</span> Maastricht, NL
            </p>
            <div className="flex gap-3 mt-3">
              <button className="text-xs text-(--color-accent) hover:underline">Bewerken</button>
              <button className="text-xs text-stone-400 hover:text-red-600">Verwijderen</button>
            </div>
          </div>
        </div>

        <button className="w-full rounded-2xl border-2 border-dashed border-stone-300 bg-white px-5 py-4 text-sm text-stone-600 hover:border-stone-400 hover:bg-stone-50 inline-flex items-center justify-center gap-2 transition-colors">
          <Plus className="h-4 w-4" /> Nieuw adres toevoegen
        </button>

        <p className="text-xs text-stone-400 text-center pt-4">
          Volledige adressen-beheer komt in een toekomstige update. Je kunt voorlopig een nieuw
          adres invoeren tijdens de checkout.
        </p>
      </div>
    </div>
  );
}
