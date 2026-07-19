import { httpClient } from './httpClient'

export interface GoodsReceiptItemPayload {
  ingredientId: string
  quantity: number
  unitCost: number
  note?: string
}

export interface GoodsReceiptPayload {
  branchId: string
  items: GoodsReceiptItemPayload[]
}

export function createGoodsReceipt(payload: GoodsReceiptPayload) {
  return httpClient('/stock-transactions/receipt', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export interface GoodsIssueItemPayload {
  ingredientId: string
  quantity: number
  reason: string
  note?: string
}

export interface GoodsIssuePayload {
  branchId: string
  items: GoodsIssueItemPayload[]
}

export function createGoodsIssue(payload: GoodsIssuePayload) {
  return httpClient('/stock-transactions/issue', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function getStockLedger(params: { branchId: string; ingredientId: string; startDate: string; endDate: string }) {
  const query = new URLSearchParams(params).toString()
  return httpClient(`/stock-transactions/ledger?${query}`)
}
