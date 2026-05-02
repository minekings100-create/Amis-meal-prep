import type { Metadata, Viewport } from 'next';
import { Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://amismeals.nl';
const SITE_DESCRIPTION =
  'Vers bereide hoog-eiwit maaltijden vanuit Maastricht. Cut, bulk, performance — wij koken, jij traint.';

export const metadata: Metadata = {
  title: { default: 'AMIS Meals — Vers, hoog-eiwit, uit Maastricht', template: '%s — AMIS Meals' },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: 'AMIS Meals',
  alternates: {
    canonical: '/',
    languages: { nl: '/', en: '/en' },
  },
  openGraph: {
    title: 'AMIS Meals',
    description: SITE_DESCRIPTION,
    siteName: 'AMIS Meals',
    type: 'website',
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og?title=AMIS%20Meals&subtitle=Vers,%20hoog-eiwit,%20uit%20Maastricht`,
        width: 1200,
        height: 630,
        alt: 'AMIS Meals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AMIS Meals',
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og?title=AMIS%20Meals&subtitle=Vers,%20hoog-eiwit,%20uit%20Maastricht`],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${sora.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
