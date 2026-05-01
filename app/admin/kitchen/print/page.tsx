import { checkAdminAccess } from '@/lib/admin/auth';
import { getProductionPlanning } from '@/lib/admin/kitchen';
import { PrintButton } from '@/components/admin/kitchen/print-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Picklijst', robots: { index: false, follow: false } };

const dateFmt = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const PRINT_CSS = `
.kitchen-print { font-family: ui-sans-serif, system-ui, sans-serif; color: #000; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; }
.kitchen-print h1 { font-size: 32px; margin: 0 0 4px 0; font-weight: 700; }
.kitchen-print h2 { font-size: 24px; margin: 24px 0 8px 0; border-top: 2px solid #000; padding-top: 12px; font-weight: 700; display: flex; justify-content: space-between; align-items: baseline; }
.kitchen-print h2 .qty { font-family: ui-monospace, monospace; font-size: 32px; }
.kitchen-print .summary { display: flex; gap: 32px; padding: 12px 0; border-bottom: 2px solid #000; margin-bottom: 24px; font-size: 14px; }
.kitchen-print .meta { color: #555; font-size: 14px; }
.kitchen-print .order-row { display: flex; align-items: flex-start; gap: 12px; padding: 4px 0; font-size: 13px; }
.kitchen-print .order-num { font-family: ui-monospace, monospace; font-weight: 600; min-width: 90px; }
.kitchen-print .order-qty { font-family: ui-monospace, monospace; font-weight: 600; min-width: 30px; text-align: right; }
.kitchen-print .order-name { color: #555; min-width: 140px; }
.kitchen-print .note { padding: 6px 10px; background: #fffbe6; border-left: 3px solid #f59e0b; margin: 4px 0; font-size: 12.5px; }
.kitchen-print .total { font-size: 20px; font-weight: 700; padding-top: 12px; border-top: 2px solid #000; margin-top: 24px; }
.kitchen-print .toolbar { position: sticky; top: 0; background: #fff; padding: 8px 0; margin-bottom: 16px; }
.kitchen-print button { padding: 6px 14px; border: 1px solid #000; background: #000; color: #fff; cursor: pointer; font-size: 13px; border-radius: 4px; }
@media print {
  .kitchen-print { padding: 0; }
  .kitchen-print .toolbar { display: none; }
}
`;

export default async function KitchenPrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await checkAdminAccess('staff');
  const sp = await searchParams;
  const dateRaw = sp.date;
  const date = (Array.isArray(dateRaw) ? dateRaw[0] : dateRaw) ?? new Date().toISOString().slice(0, 10);
  const planning = await getProductionPlanning(date);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="kitchen-print">
        <div className="toolbar">
          <PrintButton />
        </div>
        <h1>AMIS Picklijst</h1>
        <p className="meta">{dateFmt.format(new Date(date))}</p>
        <div className="summary">
          <div><strong>{planning.totalUnits}</strong> stuks totaal</div>
          <div><strong>{planning.totalOrders}</strong> orders</div>
          <div><strong>{planning.rows.length}</strong> maaltijden</div>
        </div>

        {planning.rows.map((row) => (
          <section key={row.productId || row.name}>
            <h2>
              <span>{row.name}</span>
              <span className="qty">{row.totalUnits}×</span>
            </h2>
            {row.ordersForMeal.map((o) => (
              <div key={o.orderId}>
                <div className="order-row">
                  <span className="order-qty">{o.quantity}×</span>
                  <span className="order-num">{o.orderNumber}</span>
                  <span className="order-name">{o.customerName}</span>
                </div>
                {o.customerNote && <div className="note">⚠ {o.customerNote}</div>}
              </div>
            ))}
          </section>
        ))}

        <div className="total">Totaal: {planning.totalUnits} stuks · {planning.totalOrders} orders</div>
      </div>
    </>
  );
}

