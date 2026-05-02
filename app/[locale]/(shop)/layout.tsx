import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/shop/cart-drawer';
import { CompareBar } from '@/components/shop/compare-bar';
import { CompareModal } from '@/components/shop/compare-modal';
import { Toaster } from '@/components/ui/toaster';
import { PageTransition } from '@/components/layout/page-transition';
import { CookieConsent } from '@/components/legal/cookie-consent';
import { getCurrentCustomer } from '@/lib/account/auth';

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer();
  return (
    <>
      <Header isAuthed={Boolean(customer)} />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <CompareBar />
      <CompareModal />
      <CookieConsent />
      <Toaster />
    </>
  );
}
