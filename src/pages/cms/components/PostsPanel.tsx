import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, Edit3, Trash2, Clock3, Eye } from 'lucide-react'
import { getAuthSession } from '../../../store/auth.store'
import { listPosts, deletePost, createPost, updatePost } from '../../../api/cms.api'
import type { Post, PostPayload } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { Pagination } from '../../../components/ui/Pagination'
import { formatVnDate } from '../../../utils/date'
import type { NoticeState } from './cms.types'
import { normalizeList } from './cms.utils'
import { StateShell, InlineNotice, StatusPill } from './CmsSharedUI'
import { PostEditorDialog } from './PostEditorDialog'
import { PostDetailDialog } from './PostDetailDialog'

export function PostsPanel() {
  const session = getAuthSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [viewingPost, setViewingPost] = useState<Post | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPosts = useCallback(async (currentPage: number, currentSearch: string, currentStatus: string) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 5 }
      if (currentSearch.trim()) params.search = currentSearch.trim()
      if (currentStatus !== 'all') params.status = currentStatus
      const response = await listPosts(params)
      const paginated = response.data
      if (paginated && typeof paginated === 'object' && 'items' in paginated) {
        setPosts((paginated as { items: Post[] }).items)
        const pag = (paginated as { pagination: { page: number; limit: number; total: number; totalPages: number } }).pagination
        setTotalPages(pag.totalPages)
        setTotal(pag.total)
      } else {
        setPosts(normalizeList<Post>(response.data))
        setTotalPages(1)
        setTotal(0)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không tải được danh sách bài viết.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    void fetchPosts(page, debouncedSearch, statusFilter)
  }, [page, debouncedSearch, statusFilter, fetchPosts])

  function startCreate() {
    setEditingPost(null)
    setEditorOpen(true)
  }

  function startEdit(post: Post) {
    setEditingPost(post)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Xóa bài viết này?')) return
    try {
      await deletePost(id)
      setNotice({ type: 'success', message: 'Đã xóa bài viết.' })
      void fetchPosts(page, debouncedSearch, statusFilter)
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Không xóa được bài viết.' })
    }
  }

  async function handleSave(payload: PostPayload, id?: string) {
    if (!id && session?.user?.id) {
      payload.authorId = session.user.id
    }
    const response = id ? await updatePost(id, payload) : await createPost(payload)
    const saved = response.data
    setPosts((current) => {
      const next = current.filter((item) => item.id !== saved.id)
      return [saved, ...next]
    })
    setNotice({ type: 'success', message: id ? 'Đã cập nhật bài viết.' : 'Đã tạo bài viết mới.' })
    void fetchPosts(page, debouncedSearch, statusFilter)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Posts</p>
            <h2 className="mt-1 text-[24px] font-bold">Quản lý Posts</h2>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft">
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo title, slug, category..." className="h-12 w-full rounded-[14px] border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-latte" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none">
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      {notice && <InlineNotice notice={notice} />}
      <StateShell loading={loading} error={error} empty={posts.length === 0 && !loading} title="Chưa có bài viết" description="Tạo bài viết đầu tiên cho blog / tin tức." />

      <div className="grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="grid gap-4 rounded-[22px] border border-line bg-white p-4 shadow-soft lg:grid-cols-[160px_1fr]">
            <img src={post.thumbnailUrl} alt={post.title} className="h-[140px] w-full rounded-[16px] object-cover" />
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[20px] font-semibold">{post.title}</h3>
                    <StatusPill active={post.isPublished} />
                  </div>
                  <p className="mt-2 text-sm text-muted">{post.slug} · {post.category}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-coffee/80">{post.content}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => setViewingPost(post)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                    <Eye className="h-4 w-4" />
                    Xem
                  </button>
                  <button type="button" onClick={() => startEdit(post)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                    <Edit3 className="h-4 w-4" />
                    Sửa
                  </button>
                  <button type="button" onClick={() => handleDelete(post.id)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatVnDate(post.publishedAt ?? post.createdAt)}
                </span>
                <span className="rounded-full bg-cream px-3 py-1">Tags: {post.tags || 'Không có'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && totalPages > 0 && (
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label="bài viết" />
      )}

      {viewingPost && (
        <PostDetailDialog
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onEdit={() => {
            setViewingPost(null)
            startEdit(viewingPost)
          }}
        />
      )}

      {editorOpen && (
        <PostEditorDialog
          post={editingPost}
          onClose={() => setEditorOpen(false)}
          onSave={async (payload) => {
            await handleSave(payload, editingPost?.id)
            setEditorOpen(false)
          }}
        />
      )}
    </div>
  )
}
