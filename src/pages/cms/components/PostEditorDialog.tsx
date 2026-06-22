import { useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { CmsEditorModal } from '../CmsEditorModal'
import { uploadImage } from '../../../api/cms.api'
import type { Post, PostPayload } from '../../../types'
import type { NoticeState } from './cms.types'
import { TextField, SelectField, ImageField, ToggleField, InlineNotice } from './CmsSharedUI'
import { RichTextEditor } from './RichTextEditor'

export function PostEditorDialog({
  post,
  onClose,
  onSave,
}: {
  post: Post | null
  onClose: () => void
  onSave: (payload: PostPayload) => Promise<void>
}) {
  const [draft, setDraft] = useState<PostPayload>(
    post
      ? {
        title: post.title,
        slug: post.slug,
        thumbnailUrl: post.thumbnailUrl,
        content: post.content,
        category: post.category,
        tags: post.tags || '',
        isPublished: post.isPublished,
        publishedAt: post.publishedAt ?? null,
      }
      : { title: '', slug: '', thumbnailUrl: '', content: '', category: '', tags: '', isPublished: false, publishedAt: null },
  )
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [unsaved, setUnsaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function updateDraft<K extends keyof PostPayload>(key: K, value: PostPayload[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setUnsaved(true)
  }

  async function handleUpload(file: File) {
    setSaving(true)
    setNotice(null)
    try {
      const response = await uploadImage(file, 'posts')
      updateDraft('thumbnailUrl', response.data.secure_url)
      setNotice({ type: 'success', message: 'Ảnh đại diện đã được tải lên.' })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : 'Không tải được ảnh.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        slug: draft.slug.trim(),
        category: draft.category.trim(),
        tags: draft.tags.trim(),
        content: draft.content.trim(),
      })
      setUnsaved(false)
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : 'Không lưu được bài viết.' })
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (unsaved && !window.confirm('Bạn có thay đổi chưa lưu. Đóng form mà không lưu?')) return
    onClose()
  }

  return (
    <CmsEditorModal
      open
      title={post ? 'Sửa bài viết' : 'Tạo bài viết mới'}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      {notice && <InlineNotice notice={notice} />}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <TextField label="Tiêu đề" value={draft.title} onChange={(value) => updateDraft('title', value)} required />
        <TextField label="Slug" value={draft.slug} onChange={(value) => updateDraft('slug', value)} required />
        <SelectField
          label="Danh mục"
          value={draft.category}
          onChange={(value) => updateDraft('category', value)}
          options={['Coffee', 'Food', 'Beverage', 'Lifestyle', 'Event', 'Promotion']}
        />
        <TextField
          label="Tags"
          value={draft.tags}
          onChange={(value) => updateDraft('tags', value)}
          placeholder="cà phê, espresso, đồ uống"
        />
        <ImageField label="Thumbnail" value={draft.thumbnailUrl} onChange={(value) => updateDraft('thumbnailUrl', value)} onUpload={handleUpload} fileRef={fileRef} />
        <ToggleField label="Published" checked={draft.isPublished} onChange={(checked) => updateDraft('isPublished', checked)} />
        <RichTextEditor label="Nội dung" value={draft.content} onChange={(value) => updateDraft('content', value)} />
        <TextField
          label="Published at"
          type="datetime-local"
          value={draft.publishedAt ? draft.publishedAt.slice(0, 16) : ''}
          onChange={(value) => updateDraft('publishedAt', value ? new Date(value).toISOString() : null)}
        />
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee">
            Hủy
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {post ? 'Lưu thay đổi' : 'Tạo bài viết'}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}
