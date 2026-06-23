import { CmsEditorModal } from '../CmsEditorModal'
import { formatVnDate, formatVnDateTime } from '../../../utils/date'
import { StatusPill, InfoRow } from './CmsSharedUI'
import type { Post } from '../../../types'

export function PostDetailDialog({
  post,
  onClose,
  onEdit,
}: {
  post: Post
  onClose: () => void
  onEdit: () => void
}) {
  return (
    <CmsEditorModal
      open
      title="Chi tiết bài viết"
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <div className="space-y-6">
        {/* Thumbnail */}
        {post.thumbnailUrl && (
          <div className="overflow-hidden rounded-[18px] border border-line">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="h-56 w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[24px] font-bold">{post.title}</h3>
              <StatusPill active={post.isPublished} />
            </div>
            <p className="mt-1 text-sm text-muted">{post.slug}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Danh mục" value={post.category} />
          <InfoRow label="Tags" value={post.tags || 'Không có'} />
          <InfoRow label="Ngày đăng" value={formatVnDate(post.publishedAt ?? post.createdAt)} />
          <InfoRow label="Cập nhật" value={formatVnDateTime(post.updatedAt ?? post.createdAt)} />
        </div>

        {/* Content */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-gold">Nội dung</p>
          <div
            className="cms-rendered-content rounded-[14px] border border-line bg-cream/50 p-5 text-sm leading-7 text-coffee"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft"
          >
            Sửa bài viết
          </button>
        </div>
      </div>
    </CmsEditorModal>
  )
}
