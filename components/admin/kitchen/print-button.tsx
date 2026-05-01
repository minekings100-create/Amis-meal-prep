'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()}>
      <Printer style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: 6 }} size={14} />
      Print picklijst
    </button>
  );
}
