import { useEffect, useMemo, useState, useCallback } from 'react'
import { getBranches } from '../../api/chain.api'
import type { Branch } from '../../types'
import { calculateDistanceKm } from '../landing/landing.utils'

export type BranchWithDistance = Branch & {
  distanceKm: number | null
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationNotice, setLocationNotice] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await getBranches()
        if (!alive) return
        setBranches(response.data?.items ?? [])
      } catch (loadError) {
        if (!alive) return
        setError(loadError instanceof Error ? loadError.message : 'Không tải được danh sách chi nhánh.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => { alive = false }
  }, [])

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationNotice('Trình duyệt không hỗ trợ định vị.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationNotice('Đã lấy vị trí hiện tại để sắp xếp cửa hàng gần nhất.')
      },
      () => {
        setLocationNotice('Không thể lấy vị trí. Bạn có thể nhập từ khóa để tìm cửa hàng.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  const branchesWithDistance = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...branches]
      .filter((branch) => {
        if (!q) return true
        return [branch.name, branch.address, branch.phone, branch.email ?? ''].some((value) =>
          value.toLowerCase().includes(q),
        )
      })
      .map((branch) => ({
        ...branch,
        distanceKm: userLocation
          ? calculateDistanceKm(userLocation.lat, userLocation.lng, branch.lat, branch.lng)
          : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return a.name.localeCompare(b.name)
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      })
  }, [branches, query, userLocation])

  return {
    branches: branchesWithDistance,
    loading,
    error,
    query,
    setQuery,
    userLocation,
    locationNotice,
    detectLocation,
  }
}