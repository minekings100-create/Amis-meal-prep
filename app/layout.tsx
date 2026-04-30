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

export const metadata: Metadata = {
  title: { default: 'AMIS Meals — Vers, hoog-eiwit, uit Maastricht', template: '%s · AMIS Meals' },
  description:
    'Vers bereide hoog-eiwit maaltijden uit Maastricht. Cut, bulk en performance — wij koken, jij traint.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://amismeals.nl'),
  openGraph: {
    title: 'AMIS Meals',
    description: 'Vers bereide hoog-eiwit maaltijden uit Maastricht.',
    siteName: 'AMIS Meals',
    type: 'website',
    locale: 'nl_NL',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#7cc24f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${sora.variable} ${jetbrains.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
