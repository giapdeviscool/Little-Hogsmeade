import { useCallback, useEffect, useState } from 'react'
import { Gift, Pencil, Plus, Search, Ticket, Trash2 } from 'lucide-react'
import { DataTable } from '../../../components/pages/owner/DataTable'
import { ConfirmDialog } from '../../../components/pages/owner/ConfirmDialog'
import { Skeleton } from '../../../components/ui/skeleton'
import { Pagination } from '../../../components/ui/Pagination'
import { Card } from '../../../components/ui/Card'
import {
  createLoyaltyReward,
  deleteLoyaltyReward,
  getLoyaltyRewards,
  toggleLoyaltyRewardStatus,
  updateLoyaltyReward,
} from '../../../api/loyalty.api'
import type { LoyaltyReward, LoyaltyRewardPayload, RewardDialogMode } from '../loyalty.types'
import {
  InlineSwitch,
  RewardTypeBadge,
  formatPoints,
  getRewardValueLabel,
} from './LoyaltySharedUI'
import { RewardDialog } from './RewardDialog'

type TypeFilter = 'all' | 'VOUCHER' | 'FREE_PRODUCT'
type StatusFilter = 'all' | 'active' | 'inactive'

const PAGE_SIZE = 10

function RewardsSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-10 w-full max-w-md bg-beige" />
      <Skeleton className="mt-4 h-64 w-full bg-beige" />
    </Card>
  )
}

export function RewardsCatalogTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<RewardDialogMode>('create')
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LoyaltyReward | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [search])

  const fetchRewards = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const result = await getLoyaltyRewards({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        reward_type: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })

      setRewards(result.items)
      setTotalPages(Math.max(result.pagination.totalPages, 1))
      setTotalItems(result.pagination.total)
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được danh sách phần thưởng.')
      setRewards([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, statusFilter, typeFilter])

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  const openCreateDialog = () => {
    setDialogMode('create')
    setSelectedReward(null)
    setActionError(null)
    setDialogOpen(true)
  }

  const openEditDialog = (reward: LoyaltyReward) => {
    setDialogMode('edit')
    setSelectedReward(reward)
    setActionError(null)
    setDialogOpen(true)
  }

  const handleSaveReward = async (payload: LoyaltyRewardPayload) => {
    setSaving(true)
    setActionError(null)

    try {
      if (dialogMode === 'edit' && selectedReward) {
        await updateLoyaltyReward(selectedReward.id, payload)
      } else {
        await createLoyaltyReward(payload)
        setPage(1)
      }
      await fetchRewards()
      setDialogOpen(false)
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Không lưu được phần thưởng.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (reward: LoyaltyReward) => {
    setSaving(true)
    setActionError(null)

    // Cập nhật local state trước để UI phản hồi ngay lập tức (Optimistic Update)
    setRewards(prev =>
      prev.map(item => (item.id === reward.id ? { ...item, isActive: !item.isActive } : item))
    )

    try {
      await toggleLoyaltyRewardStatus(reward)
    } catch (error: unknown) {
      // Revert lại trạng thái cũ nếu API gọi thất bại
      setRewards(prev =>
        prev.map(item => (item.id === reward.id ? { ...item, isActive: reward.isActive } : item))
      )
      setActionError(error instanceof Error ? error.message : 'Không đổi được trạng thái phần thưởng.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReward = async () => {
    if (!deleteTarget) return

    setSaving(true)
    setActionError(null)

    try {
      await deleteLoyaltyReward(deleteTarget.id)
      await fetchRewards()
      setDeleteTarget(null)
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Không ngưng áp dụng phần thưởng.')
    } finally {
      setSaving(false)
    }
  }

  if (loading && rewards.length === 0 && !loadError) {
    return <RewardsSkeleton />
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-coffee">Danh sách phần thưởng</h2>
          <p className="mt-1 text-sm text-muted">Quản lý các gói quà khách có thể đổi bằng điểm tích lũy.</p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition hover:bg-coffee/90"
        >
          <Plus className="h-4 w-4" />
          Thêm phần thưởng
        </button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm"
              placeholder="Tìm theo tên phần thưởng..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            className="h-10 rounded-lg border border-line bg-white px-3 text-sm"
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as TypeFilter)
              setPage(1)
            }}
          >
            <option value="all">Tất cả loại</option>
            <option value="VOUCHER">Voucher</option>
            <option value="FREE_PRODUCT">Sản phẩm miễn phí</option>
          </select>
          <select
            className="h-10 rounded-lg border border-line bg-white px-3 text-sm"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter)
              setPage(1)
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang áp dụng</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
        </div>
      </Card>

      {loadError ? (
        <Card className="p-5">
          <p className="text-sm font-medium text-[#c25a5a]">{loadError}</p>
          <button
            type="button"
            onClick={fetchRewards}
            className="mt-4 h-10 rounded-lg bg-coffee px-5 text-sm font-semibold text-white transition hover:bg-coffee/90"
          >
            Tải lại
          </button>
        </Card>
      ) : (
        <>
          <DataTable
            data={rewards}
            colSpan={6}
            emptyMessage="Chưa có phần thưởng nào."
            renderHeader={() => (
              <tr>
                <th className="px-4 py-3">Tên phần thưởng</th>
                <th className="px-4 py-3">Loại phần thưởng</th>
                <th className="px-4 py-3 text-right">Điểm yêu cầu</th>
                <th className="px-4 py-3">Giá trị quy đổi</th>
                <th className="min-w-[160px] px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            )}
            renderRow={(reward) => (
              <tr key={reward.id} className="border-t border-line bg-white">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-beige text-coffee">
                      {reward.type === 'VOUCHER' ? <Ticket className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className="font-semibold text-coffee">{reward.name}</p>
                      {reward.description ? <p className="mt-0.5 text-xs text-muted">{reward.description}</p> : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RewardTypeBadge type={reward.type} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-[#d99a4b]">{formatPoints(reward.pointsRequired)}</span>
                </td>
                <td className="px-4 py-3 text-sm text-coffee">{getRewardValueLabel(reward)}</td>
                <td className="min-w-[160px] px-4 py-3">
                  <InlineSwitch
                    label={reward.isActive ? 'Đang hoạt động' : 'Ngừng áp dụng'}
                    checked={reward.isActive}
                    disabled={saving}
                    onChange={() => handleToggleStatus(reward)}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-beige hover:text-coffee"
                      onClick={() => openEditDialog(reward)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#c25a5a] transition hover:bg-red-50"
                      onClick={() => setDeleteTarget(reward)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />

          {totalPages > 1 || totalItems > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalItems}
              onPageChange={setPage}
              label="phần thưởng"
            />
          ) : null}
        </>
      )}

      {actionError ? <p className="text-sm font-medium text-[#c25a5a]">{actionError}</p> : null}

      <RewardDialog
        isOpen={dialogOpen}
        mode={dialogMode}
        reward={selectedReward}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveReward}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Ngưng áp dụng phần thưởng này?"
        description="Phần thưởng sẽ được chuyển sang trạng thái không hoạt động và ẩn khỏi danh sách đổi thưởng."
        confirmLabel="Ngưng áp dụng"
        loading={saving}
        onConfirm={handleDeleteReward}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  )
}
