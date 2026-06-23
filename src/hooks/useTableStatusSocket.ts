import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { getAuthToken } from '../store/auth.store'
import type { TableStatusUpdatedEvent } from '../types'

export function useTableStatusSocket(branchId: number | string | null, onStatusUpdated: (event: TableStatusUpdatedEvent) => void) {
  const callbackRef = useRef(onStatusUpdated)
  callbackRef.current = onStatusUpdated

  useEffect(() => {
    if (branchId === null) return

    const socket = io('/', {
      auth: { token: getAuthToken() },
      query: { branchId: String(branchId) },
    })

    const handleStatusUpdated = (event: TableStatusUpdatedEvent) => {
      if (event.branchId !== undefined && String(event.branchId) !== String(branchId)) return
      callbackRef.current(event)
    }

    socket.on('table_status_updated', handleStatusUpdated)

    return () => {
      socket.off('table_status_updated', handleStatusUpdated)
      socket.disconnect()
    }
  }, [branchId])
}
