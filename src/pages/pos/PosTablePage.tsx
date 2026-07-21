import { useState } from 'react';
import { PosLayout } from '@/layouts/PosLayout';
import { TableLayoutContent } from '@/pages/operations/TableLayoutPage';
import { getAuthSession } from '@/store/auth.store';
import { env } from '@/config/env';

export function PosTablePage() {
  const session = getAuthSession();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    session?.user?.branchId || env.defaultBranchId || null
  );

  return (
    <PosLayout>
      <div className="flex-1 overflow-auto bg-beige">
        <TableLayoutContent 
          branchId={selectedBranchId} 
          onBranchChange={setSelectedBranchId} 
          className="min-h-full p-2 bg-beige" 
        />
      </div>
    </PosLayout>
  );
}
