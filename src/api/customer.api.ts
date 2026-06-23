import { httpClient } from './httpClient'
import type { ApiResponse } from '../types'
import type { Customer, CustomerMembership, PointTransaction } from '../types/customer.types'
import type { Promotion } from '../types/chain.types'

// Note: customers API doesn't need authHeaders for public lookup
export function searchCustomerByPhone(phone: string) {
  return httpClient<ApiResponse<Customer[]>>(`/customers?phone=${phone}`)
}

export function getCustomerMemberships(customerId: string) {
  return httpClient<ApiResponse<CustomerMembership[]>>(`/customer-memberships?customerId=${customerId}&_expand=tier`)
}

export function getPointTransactions(membershipId: string) {
  return httpClient<ApiResponse<PointTransaction[]>>(`/point-transactions?customerMembershipId=${membershipId}&_sort=createdAt&_order=desc`)
}

// Giả lập API đổi điểm
export function redeemPoints(payload: { customerMembershipId: string, points: number, note: string }) {
  // 1. Trừ điểm vào CustomerMembership
  // 2. Ghi PointTransaction
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

export function getActiveCampaigns() {
  return httpClient<ApiResponse<Promotion[]>>('/campaigns?isActive=true')
}
