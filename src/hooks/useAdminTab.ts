import { useState } from 'react'
import type { TabKey } from '../constants/navigation'

export function useAdminTab(initial: TabKey = 'dashboard') {
  return useState<TabKey>(initial)
}
