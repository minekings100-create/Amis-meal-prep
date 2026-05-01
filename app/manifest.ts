import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AMIS Meals',
    short_name: 'AMIS',
    description: 'Vers bereide hoog-eiwit maaltijden vanuit Maastricht.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7cc24f',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
