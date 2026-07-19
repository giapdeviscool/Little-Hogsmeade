import { httpClient } from './httpClient'

export interface StocktakeNoteItemPayload {
  ingredientId: string
  systemQuantity: number
  actualQuantity: number
  variance?: number
  reason?: string
  note?: string
}

export interface StocktakeNotePayload {
  branchId: string
  note?: string
  items: StocktakeNoteItemPayload[]
}

export function createStocktakeNote(payload: StocktakeNotePayload) {
  return httpClient('/stocktakes', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function getPendingStocktakes(branchId: string) {
  return httpClient(`/stocktakes/pending?branchId=${branchId}`)
}

export function processStocktake(noteId: string, action: 'APPROVE' | 'REJECT') {
  return httpClient(`/stocktakes/${noteId}/process`, {
    method: 'POST',
    body: JSON.stringify({ action })
  })
}
