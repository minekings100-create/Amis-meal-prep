import { requireCustomer } from '@/lib/account/auth';
import { AccountSidebar } from '@/components/account/sidebar';

export default async function AccountAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await requireCustomer('/account');

  return (
    <div className="container-amis py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <AccountSidebar customer={customer} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
