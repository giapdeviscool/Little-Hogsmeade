import { useEffect, useState } from 'react'
import { Search, UserRound } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Skeleton } from '../../../components/ui/skeleton'
import { Pagination } from '../../../components/ui/Pagination'
import { DataTable } from '../../../components/pages/owner/DataTable'
import { fetchCustomerList } from '../../../api/customer.api'
import { getMembershipTiers } from '../../../api/loyalty.api'
import type { CustomerListItem, MembershipTierCode } from '../../../types/customer.types'
import type { MembershipTier } from '../../../api/loyalty.api'
import { CustomerProfileDrawer } from './CustomerProfileDrawer'
import {
  CustomerTierBadge,
  formatCustomerPoints,
  formatCustomerSpent,
  getCustomerInitials,
} from './CustomerSharedUI'

type TierFilter = 'all' | MembershipTierCode

type CustomerFilterParams = {
  page: number
  limit: number
  search: string
  tier: TierFilter
}

const PAGE_SIZE = 10

function CustomerListSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-t border-line px-4 py-4 first:border-t-0">
            <Skeleton className="h-10 w-10 rounded-full bg-beige" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 bg-beige" />
              <Skeleton className="h-3 w-28 bg-beige" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full bg-beige" />
            <Skeleton className="h-4 w-20 bg-beige" />
            <Skeleton className="h-4 w-24 bg-beige" />
          </div>
        ))}
      </div>
    </Card>
  )
}

function CustomerAvatar({ customer }: { customer: CustomerListItem }) {
  if (customer.avatarUrl) {
    return (
      <img
        src={customer.avatarUrl}
        alt={customer.fullName}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-beige text-sm font-semibold text-coffee">
      {getCustomerInitials(customer.fullName)}
    </span>
  )
}

export function CustomerListPanel() {
  const [filterParams, setFilterParams] = useState<CustomerFilterParams>({
    page: 1,
    limit: PAGE_SIZE,
    search: '',
    tier: 'all',
  })
  const [searchInput, setSearchInput] = useState('')
  const [customers, setCustomers] = useState<CustomerListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedCustomerPreview, setSelectedCustomerPreview] = useState<CustomerListItem | null>(null)
  const [dynamicTiers, setDynamicTiers] = useState<MembershipTier[]>([])

  useEffect(() => {
    getMembershipTiers().then(setDynamicTiers).catch(console.error)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim()
      setFilterParams((prev) => {
        if (prev.search === nextSearch) return prev
        return { ...prev, search: nextSearch, page: 1 }
      })
    }, 500)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let active = true

    const loadCustomers = async () => {
      setLoading(true)
      setLoadError(null)

      try {
        const result = await fetchCustomerList({
          page: filterParams.page,
          limit: filterParams.limit,
          search: filterParams.search || undefined,
          tier: filterParams.tier === 'all' ? undefined : filterParams.tier,
        })

        if (!active) return

        setCustomers(result.items)
        setTotalPages(Math.max(result.pagination.totalPages, 1))
        setTotalItems(result.pagination.total)
      } catch (error: unknown) {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : 'Không tải được danh sách khách hàng.')
        setCustomers([])
        setTotalPages(1)
        setTotalItems(0)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadCustomers()

    return () => {
      active = false
    }
  }, [filterParams])

  const handleTierChange = (tier: TierFilter) => {
    setFilterParams((prev) => ({ ...prev, tier, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilterParams((prev) => ({ ...prev, page }))
  }

  const handleOpenProfile = (customer: CustomerListItem) => {
    setSelectedCustomerPreview(customer)
    setSelectedCustomerId(customer.id)
  }

  const handleCloseProfile = () => {
    setSelectedCustomerId(null)
    setSelectedCustomerPreview(null)
  }

  return (
    <section className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>
          <select
            className="h-10 rounded-lg border border-line bg-white px-3 text-sm"
            value={filterParams.tier}
            onChange={(event) => handleTierChange(event.target.value as TierFilter)}
          >
            <option value="all">Tất cả hạng thẻ</option>
            {dynamicTiers.length > 0 ? dynamicTiers.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            )) : (
              <>
                <option value="MEMBER">Member</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="VIP">VIP</option>
              </>
            )}
          </select>
        </div>
      </Card>

      {loadError ? (
        <Card className="p-5">
          <p className="text-sm font-medium text-[#c25a5a]">{loadError}</p>
          <button
            type="button"
            onClick={() => setFilterParams((prev) => ({ ...prev }))}
            className="mt-4 h-10 rounded-lg bg-coffee px-5 text-sm font-semibold text-white transition hover:bg-coffee/90"
          >
            Tải lại
          </button>
        </Card>
      ) : loading ? (
        <CustomerListSkeleton />
      ) : (
        <>
          <DataTable
            data={customers}
            colSpan={5}
            emptyMessage="Chưa có khách hàng nào."
            renderHeader={() => (
              <tr>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Hạng thẻ</th>
                <th className="px-4 py-3 text-right">Điểm tích lũy</th>
                <th className="px-4 py-3 text-right">Tổng chi tiêu</th>
              </tr>
            )}
            renderRow={(customer) => (
              <tr
                key={customer.id}
                className="cursor-pointer border-t border-line bg-white transition hover:bg-cream"
                onClick={() => handleOpenProfile(customer)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CustomerAvatar customer={customer} />
                    <div>
                      <p className="font-semibold text-coffee">{customer.fullName}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        <UserRound className="h-3 w-3" />
                        Thành viên
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-coffee">{customer.phone}</td>
                <td className="px-4 py-3">
                  <CustomerTierBadge tier={customer.tier} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-[#d99a4b]">{formatCustomerPoints(customer.totalPoints)}</span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-coffee">
                  {formatCustomerSpent(customer.totalSpent)}
                </td>
              </tr>
            )}
          />

          {totalItems > 0 ? (
            <Pagination
              page={filterParams.page}
              totalPages={totalPages}
              total={totalItems}
              onPageChange={handlePageChange}
              label="khách hàng"
            />
          ) : null}
        </>
      )}

      <CustomerProfileDrawer
        customerId={selectedCustomerId}
        preview={selectedCustomerPreview}
        onClose={handleCloseProfile}
      />
    </section>
  )
}
