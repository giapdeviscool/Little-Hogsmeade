import { httpClient } from './httpClient'
import type { ApiResponse, CustomerListApiRecord, CustomerListItem, CustomerListParams, PaginatedData } from '../types'
import type {
  Customer,
  CustomerMembership,
  CustomerOrderApiRecord,
  CustomerOrderHistoryItem,
  CustomerPointTransaction,
  CustomerPointTransactionApiRecord,
  CustomerProfile,
  CustomerProfileApiRecord,
  MembershipTierCode,
  PointTransaction,
  PointTransactionType,
} from '../types/customer.types'
import type { Voucher } from '../types/chain.types'

const TIER_CODES: MembershipTierCode[] = ['MEMBER', 'SILVER', 'GOLD', 'VIP']

function normalizeTier(value?: string | null): MembershipTierCode {
  const normalized = (value ?? 'MEMBER').toUpperCase()
  if (TIER_CODES.includes(normalized as MembershipTierCode)) {
    return normalized as MembershipTierCode
  }
  return 'MEMBER'
}

function normalizeTransactionType(value?: string | null): PointTransactionType {
  const normalized = (value ?? 'EARN').toUpperCase()
  if (normalized === 'REDEEM' || normalized === 'EXPIRED' || normalized === 'EARN') {
    return normalized
  }
  return 'EARN'
}

function normalizeBriefItems(value?: string | string[] | null) {
  if (!value) return '—'
  if (Array.isArray(value)) return value.join(', ')
  return value
}

export function mapCustomerListItemFromApi(data: CustomerListApiRecord): CustomerListItem {
  const membership = data.membership
  const tierFromMembership =
    typeof membership?.tier === 'string'
      ? membership.tier
      : membership?.tier?.name

  return {
    id: data.id,
    fullName: data.fullName ?? data.full_name ?? 'Khách hàng',
    phone: data.phone,
    avatarUrl: data.avatarUrl ?? data.avatar_url ?? undefined,
    tier: normalizeTier(data.tier ?? tierFromMembership),
    totalPoints: data.totalPoints ?? data.total_points ?? membership?.totalPoints ?? membership?.total_points ?? 0,
    totalSpent: data.totalSpent ?? data.total_spent ?? membership?.totalSpent ?? membership?.total_spent ?? 0,
  }
}

export function mapCustomerProfileFromApi(data: CustomerProfileApiRecord): CustomerProfile {
  const listItem = mapCustomerListItemFromApi(data)

  return {
    ...listItem,
    email: data.email ?? undefined,
    birthday: data.birthday ?? null,
    createdAt: data.createdAt ?? data.created_at ?? new Date().toISOString(),
    source: data.source ?? 'walk-in',
  }
}

export function mapCustomerOrderFromApi(data: CustomerOrderApiRecord): CustomerOrderHistoryItem {
  return {
    id: data.id,
    orderCode: data.orderCode ?? data.order_code ?? `ORD-${data.id.slice(-6).toUpperCase()}`,
    purchasedAt: data.createdAt ?? data.created_at ?? '',
    branchName: data.branchName ?? data.branch_name ?? '—',
    briefItems: normalizeBriefItems(data.brief_items ?? (data as { briefItems?: string | string[] }).briefItems),
    totalAmount: data.totalAmount ?? data.total_amount,
  }
}

export function mapCustomerPointTransactionFromApi(
  data: CustomerPointTransactionApiRecord,
): CustomerPointTransaction {
  const pointsVal = data.points ?? data.points_changed ?? 0
  return {
    id: data.id ?? data.transaction_id ?? '',
    transactionType: normalizeTransactionType(
      data.transaction_type ?? data.transactionType ?? data.type,
    ),
    points: Math.abs(pointsVal),
    note: data.note ?? data.description ?? undefined,
    createdAt: data.createdAt ?? data.created_at ?? '',
  }
}

function buildCustomersQuery(params: CustomerListParams = {}) {
  const query = new URLSearchParams()

  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search?.trim()) query.set('search', params.search.trim())
  if (params.tier) query.set('tier', params.tier)

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function defaultPagination(params: CustomerListParams, total: number) {
  const limit = params.limit ?? 10
  return {
    page: params.page ?? 1,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  }
}

function normalizeCustomerListResponse(raw: unknown, params: CustomerListParams = {}) {
  if (!raw) {
    return { items: [], pagination: defaultPagination(params, 0) }
  }

  if (Array.isArray(raw)) {
    const items = raw.map((record) => mapCustomerListItemFromApi(record as CustomerListApiRecord))
    return {
      items,
      pagination: defaultPagination(params, items.length),
    }
  }

  const paginated = raw as PaginatedData<CustomerListApiRecord>
  const items = (paginated.items ?? []).map(mapCustomerListItemFromApi)

  return {
    items,
    pagination: paginated.pagination ?? defaultPagination(params, items.length),
  }
}

function normalizeArrayResponse<TApi, TItem>(
  raw: unknown,
  mapper: (record: TApi) => TItem,
): TItem[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((record) => mapper(record as TApi))

  const paginated = raw as PaginatedData<TApi>
  if (Array.isArray(paginated.items)) {
    return paginated.items.map(mapper)
  }

  return []
}

export function getCustomers(params: CustomerListParams = {}) {
  return httpClient<ApiResponse<PaginatedData<CustomerListApiRecord> | CustomerListApiRecord[]>>(
    `/customers${buildCustomersQuery(params)}`,
  )
}

export async function fetchCustomerList(params: CustomerListParams = {}) {
  const response = await getCustomers(params)
  return normalizeCustomerListResponse(response.data, params)
}

export async function fetchCustomerProfile(customerId: string): Promise<CustomerProfile> {
  const response = await httpClient<ApiResponse<CustomerProfileApiRecord>>(`/customers/${customerId}`)
  if (!response.data) {
    throw new Error('Khách hàng không tồn tại hoặc đã bị xóa.')
  }
  return mapCustomerProfileFromApi(response.data)
}

export async function fetchCustomerOrders(customerId: string): Promise<CustomerOrderHistoryItem[]> {
  const response = await httpClient<ApiResponse<PaginatedData<CustomerOrderApiRecord> | CustomerOrderApiRecord[]>>(
    `/customers/${customerId}/orders`,
  )
  return normalizeArrayResponse(response.data, mapCustomerOrderFromApi)
}

export async function fetchCustomerPointTransactions(customerId: string): Promise<CustomerPointTransaction[]> {
  const response = await httpClient<
    ApiResponse<PaginatedData<CustomerPointTransactionApiRecord> | CustomerPointTransactionApiRecord[]>
  >(`/customers/${customerId}/points`)

  return normalizeArrayResponse(response.data, mapCustomerPointTransactionFromApi).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function searchCustomerByPhone(phone: string) {
  return httpClient<ApiResponse<Customer[]>>(`/customers?phone=${phone}`)
}

export function checkCustomerPhone(phone: string) {
  return httpClient<{ status: 'not_found' | 'no_pin' | 'has_pin', customer?: { id: string, fullName: string } }>(`/customers/auth/check-phone?phone=${phone}`)
}

export function customerLogin(payload: { phone: string, pin: string, fullName?: string }) {
  return httpClient<ApiResponse<CustomerProfileApiRecord>>('/customers/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function quickRegisterCustomer(payload: { name: string; phone: string }) {
  return httpClient<ApiResponse<{ _id: string; name: string; phone: string; points: number }>>('/customers/quick-register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function getCustomerMemberships(customerId: string) {
  return httpClient<ApiResponse<CustomerMembership[]>>(`/customer-memberships?customerId=${customerId}&_expand=tier`)
}

export function getPointTransactions(membershipId: string) {
  return httpClient<ApiResponse<PointTransaction[]>>(`/point-transactions?customerMembershipId=${membershipId}&_sort=createdAt&_order=desc`)
}

export function redeemPoints(payload: { customerMembershipId: string, points: number, note: string }) {
  return httpClient<ApiResponse<PointTransaction>>('/point-transactions', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      type: 'redeem',
      points: -payload.points
    })
  })
}

export function updateMembershipPoints(id: string, totalPoints: number) {
  return httpClient<ApiResponse<CustomerMembership>>(`/customer-memberships/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ totalPoints })
  })
}

export function getActiveVouchers() {
  return httpClient<ApiResponse<Voucher[]>>('/vouchers?isActive=true')
}


export function getCustomerVouchers(customerId: string) {
  return httpClient<ApiResponse<Voucher[]>>('/vouchers?isActive=true&customerId=' + customerId)
}

export function redeemLoyaltyRewardApi(customerId: string, rewardId: string) {
  return httpClient<ApiResponse<any>>('/customers/' + customerId + '/loyalty/redeem', {
    method: 'POST',
    body: JSON.stringify({ rewardId })
  })
}

export function updateCustomerMembershipApi(customerId: string, payload: { totalPoints?: number, tierId?: string }) {
  return httpClient<ApiResponse<any>>('/customers/' + customerId + '/membership', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}
