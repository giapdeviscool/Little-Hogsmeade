import { httpClient } from './httpClient'
import type { BranchTableFilters, BranchTableLayoutResponse } from '../types'

export async function getBranchTableLayout(branchId: number | string, filters: BranchTableFilters = {}) {
  const query = new URLSearchParams()

  if (filters.area) query.set('area', filters.area)
  if (filters.status) query.set('status', filters.status)

  const queryString = query.toString()
  const path = `/branches/${encodeURIComponent(branchId)}/tables${queryString ? `?${queryString}` : ''}`
  const response = await httpClient<BranchTableLayoutResponse>(path)

  return response.data
}
