export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-[-0.025em]">Dashboard</h1>
        <p className="text-stone-600 mt-1">Welkom terug.</p>
      </header>

      <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
        <p className="text-stone-500">
          Dashboard widgets komen in stap 2 — voor nu valideren we layout + auth.
        </p>
      </div>
    </div>
  );
}
