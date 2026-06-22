import React from 'react';
import { InvoiceHeader } from '@/layouts/InvoiceHeader';

export function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-beige text-coffee min-h-screen font-sans overflow-hidden">
      <InvoiceHeader />
      <main className="pt-20 flex h-screen">
        {children}
      </main>
    </div>
  );
}
