'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error.tsx]', error);
  }, [error]);

  return (
    <html lang="nl">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: '#f7f7f5',
          margin: 0,
          padding: '2rem',
          color: '#131613',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 96,
              fontWeight: 700,
              color: '#b45309',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              margin: 0,
            }}
          >
            !
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>
            Er is een kritieke fout opgetreden
          </h1>
          <p style={{ color: '#4a4d49', marginBottom: 32 }}>
            We konden de pagina niet laden. Probeer het opnieuw of bezoek amismeals.nl.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              borderRadius: 16,
              backgroundColor: '#4a8a3c',
              color: 'white',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Probeer opnieuw
          </button>
        </div>
      </body>
    </html>
  );
}
