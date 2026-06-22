import React from 'react';
import { PosHeader } from './PosHeader';
import { PosSidebar } from './PosSidebar';

interface PosLayoutProps {
  children: React.ReactNode;
}

export function PosLayout({ children }: PosLayoutProps) {
  return (
    <div className="bg-beige text-coffee min-h-screen font-sans overflow-hidden flex flex-col">
      <PosHeader />
      <div className="flex flex-1 pt-20">
        <PosSidebar />
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-72 flex bg-beige h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
