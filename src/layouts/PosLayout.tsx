import React from 'react';
import { PosHeader } from './PosHeader';

interface PosLayoutProps {
  children: React.ReactNode;
}

export function PosLayout({ children }: PosLayoutProps) {
  return (
    <div className="bg-beige text-coffee min-h-screen font-sans overflow-hidden flex flex-col">
      <PosHeader />
      <div className="flex h-screen pt-20">
        {/* Main Content Area: Two-Column Grid */}
        <main className="flex-1 flex bg-beige h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
