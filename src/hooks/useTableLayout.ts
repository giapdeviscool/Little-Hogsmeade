import { useQuery } from '@tanstack/react-query'
import { getBranchTableLayout } from '../api/table.api'
import type { BranchTableFilters } from '../types'

export const tableLayoutQueryKeys = {
  branch: (branchId: number | string | null, filters: BranchTableFilters) => ['branches', branchId, 'tables', filters] as const,
}

export function useBranchTableLayout(branchId: number | string | null, filters: BranchTableFilters = {}) {
  return useQuery({
    queryKey: tableLayoutQueryKeys.branch(branchId, filters),
    queryFn: () => getBranchTableLayout(branchId!, filters),
    enabled: branchId !== null,
  })
}
