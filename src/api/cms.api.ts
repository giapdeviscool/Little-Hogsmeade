import { httpClient } from './httpClient'
import type { ApiResponse } from '../types'
import type { Banner, BannerPayload, CmsPage, CmsPagePayload, Event, EventPayload, Post, PostPayload, Promotion, PromotionPayload, UploadImageResponse } from '../types/cms.types'

export function listPages() {
  return httpClient<ApiResponse<CmsPage[]>>('/pages')
}

export function createPage(payload: CmsPagePayload) {
  return httpClient<ApiResponse<CmsPage>>('/pages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePage(id: string, payload: CmsPagePayload) {
  return httpClient<ApiResponse<CmsPage>>(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deletePage(id: string) {
  return httpClient<ApiResponse<{ id: string }>>(`/pages/${id}`, {
    method: 'DELETE',
  })
}

export function listBanners() {
  return httpClient<ApiResponse<Banner[]>>('/banners')
}

export function createBanner(payload: BannerPayload) {
  return httpClient<ApiResponse<Banner>>('/banners', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateBanner(id: string, payload: BannerPayload) {
  return httpClient<ApiResponse<Banner>>(`/banners/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteBanner(id: string) {
  return httpClient<ApiResponse<{ id: string }>>(`/banners/${id}`, {
    method: 'DELETE',
  })
}

export function listPosts() {
  return httpClient<ApiResponse<Post[]>>('/posts')
}

export function createPost(payload: PostPayload) {
  return httpClient<ApiResponse<Post>>('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePost(id: string, payload: PostPayload) {
  return httpClient<ApiResponse<Post>>(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deletePost(id: string) {
  return httpClient<ApiResponse<{ id: string }>>(`/posts/${id}`, {
    method: 'DELETE',
  })
}

export function listEvents() {
  return httpClient<ApiResponse<Event[]>>('/events')
}

export function createEvent(payload: EventPayload) {
  return httpClient<ApiResponse<Event>>('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateEvent(id: string, payload: EventPayload) {
  return httpClient<ApiResponse<Event>>(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteEvent(id: string) {
  return httpClient<ApiResponse<{ id: string }>>(`/events/${id}`, {
    method: 'DELETE',
  })
}

export function listPromotions() {
  return httpClient<ApiResponse<Promotion[]>>('/promotions')
}

export function createPromotion(payload: PromotionPayload) {
  return httpClient<ApiResponse<Promotion>>('/promotions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePromotion(id: string, payload: PromotionPayload) {
  return httpClient<ApiResponse<Promotion>>(`/promotions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deletePromotion(id: string) {
  return httpClient<ApiResponse<{ id: string }>>(`/promotions/${id}`, {
    method: 'DELETE',
  })
}

export async function uploadImage(file: File, folder?: string) {
  const formData = new FormData()
  formData.append('image', file)
  if (folder) {
    formData.append('folder', folder)
  }

  return httpClient<ApiResponse<UploadImageResponse>>('/uploads/image', {
    method: 'POST',
    body: formData,
  })
}

