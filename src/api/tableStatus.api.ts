import axios from 'axios'
import { env } from '../config/env'
import { getAuthToken } from '../store/auth.store'
import type { BranchTable, UpdateTableStatusPayload } from '../types'

type UpdateTableStatusResponse = {
  status: 'success'
  message: string
  data: BranchTable
}

export async function updateTableStatus(tableId: number | string, payload: UpdateTableStatusPayload) {
  const token = getAuthToken()
  const response = await axios.patch<UpdateTableStatusResponse>(
    `${env.apiBaseUrl}/tables/${tableId}/status`,
    payload,
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
  )

  return response.data
}
